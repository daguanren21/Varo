<script setup lang="ts">
import type {
  AgentRagAnswerPart,
  AgentRagPipelineProps,
  AgentRagSource,
  AgentRagSourceTone,
  AgentRagStageId,
  AgentRagStep,
} from './rag-pipeline'
import { computed, onBeforeUnmount, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import { agentRagIcons } from './rag-icons'
import { getRagSourceTone, resolveRagSteps } from './rag-pipeline'

interface CitationPartView {
  ariaLabel: string
  canSelect: boolean
  className: string
  id: string
  isText: false
  label: string
  pressed: boolean
  source?: AgentRagSource
  sourceId: string
  text: ''
}

interface TextPartView {
  ariaLabel: ''
  canSelect: false
  className: string
  id: string
  isText: true
  label: ''
  pressed: false
  sourceId: ''
  text: string
}

type AnswerPartView = CitationPartView | TextPartView
type StyleValue = Record<string, string>

const props = withDefaults(defineProps<AgentRagPipelineProps>(), {
  answer: () => [],
  query: '',
  reducedMotion: false,
  sources: () => [],
  steps: () => [],
  title: '检索增强生成',
})

const emit = defineEmits<{
  cancel: []
  run: []
  selectSource: [source: AgentRagSource]
}>()

const VECTOR_CELLS = Array.from({ length: 24 }, (_, index) => index + 1)
const PING_TIMEOUT_MS = 400

const toneClasses: Record<AgentRagSourceTone, string> = {
  blue: 'agent-rag--tone-blue [--agent-rag-source:var(--varo-agent-source-blue)] [--agent-rag-source-soft:var(--varo-agent-source-blue-soft)]',
  violet: 'agent-rag--tone-violet [--agent-rag-source:var(--varo-agent-source-violet)] [--agent-rag-source-soft:var(--varo-agent-source-violet-soft)]',
  rose: 'agent-rag--tone-rose [--agent-rag-source:var(--varo-agent-source-rose)] [--agent-rag-source-soft:var(--varo-agent-source-rose-soft)]',
}

function createIconStyle(source: string): StyleValue {
  const mask = `url("${source}")`
  return {
    '-webkit-mask-image': mask,
    '-webkit-mask-position': 'center',
    '-webkit-mask-repeat': 'no-repeat',
    '-webkit-mask-size': 'contain',
    'mask-image': mask,
    'mask-position': 'center',
    'mask-repeat': 'no-repeat',
    'mask-size': 'contain',
  }
}

const stageIconStyles: Record<AgentRagStageId, StyleValue> = {
  query: createIconStyle(agentRagIcons.query),
  embed: createIconStyle(agentRagIcons.embed),
  retrieve: createIconStyle(agentRagIcons.retrieve),
  assemble: createIconStyle(agentRagIcons.assemble),
  generate: createIconStyle(agentRagIcons.generate),
}

function collectCitationSources(answer: readonly AgentRagAnswerPart[]) {
  const sources = new Map<string, string>()
  for (const part of answer) {
    if (part.type === 'citation') { sources.set(part.id, part.sourceId) }
  }
  return sources
}

const selectedSourceId = shallowRef('')
const pingSourceIds = shallowRef<ReadonlySet<string>>(new Set())
const pingTimers = new Map<string, () => void>()
let observedCitationSources = collectCitationSources(props.answer)

function clearPing() {
  for (const cancel of pingTimers.values()) { cancel() }
  pingTimers.clear()
  pingSourceIds.value = new Set()
}

function clearSourcePing(sourceId: string) {
  pingTimers.get(sourceId)?.()
  pingTimers.delete(sourceId)
  const next = new Set(pingSourceIds.value)
  next.delete(sourceId)
  pingSourceIds.value = next
}

function resetLocalState() {
  clearPing()
  selectedSourceId.value = ''
  observedCitationSources = collectCitationSources(props.answer)
}

function triggerPing(sourceId: string) {
  if (props.reducedMotion || !props.sources.some(source => source.id === sourceId)) { return }
  pingTimers.get(sourceId)?.()
  const next = new Set(pingSourceIds.value)
  next.add(sourceId)
  pingSourceIds.value = next
  const timer = setTimeout(() => {
    pingTimers.delete(sourceId)
    const remaining = new Set(pingSourceIds.value)
    remaining.delete(sourceId)
    pingSourceIds.value = remaining
  }, PING_TIMEOUT_MS)
  pingTimers.set(sourceId, () => clearTimeout(timer))
}

function selectSource(source: AgentRagSource) {
  selectedSourceId.value = source.id
  emit('selectSource', source)
}

function selectCitation(part: AnswerPartView) {
  if (part.isText || !part.canSelect || !part.source) { return }
  selectSource(part.source)
}

const resolvedStages = computed(() => resolveRagSteps(props.steps))
const anyRunning = computed(() => resolvedStages.value.some(stage => stage.status === 'running'))
const allCompleted = computed(() => resolvedStages.value.every(stage => stage.status === 'completed'))
const hasFailure = computed(() => resolvedStages.value.some(stage => stage.status === 'failed'))
const completedCount = computed(() => resolvedStages.value.filter(stage => stage.status === 'completed').length)

const overallStatus = computed<AgentRagStep['status']>(() => {
  if (anyRunning.value) { return 'running' }
  if (hasFailure.value) { return 'failed' }
  if (allCompleted.value) { return 'completed' }
  return 'waiting'
})

const rootClass = computed(() => cn(
  'agent-rag box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-text)] shadow-sm',
  props.reducedMotion && 'agent-rag--reduced-motion',
  props.className,
))

const showElapsed = computed(() => props.elapsedMs !== undefined)
const elapsedLabel = computed(() => {
  if (props.elapsedMs === undefined) { return '' }
  return `${Math.max(0, Math.round(props.elapsedMs))} ms`
})
const hasQuery = computed(() => props.query.length > 0)

function markerClass(status: AgentRagStep['status']) {
  return cn(
    'agent-rag__marker relative z-[1] grid h-8 w-8 place-items-center rounded-full border bg-[var(--varo-agent-surface)]',
    status === 'waiting' && 'border-[var(--varo-agent-border-strong)] text-[var(--varo-agent-muted)]',
    status === 'running' && 'is-running border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary-soft)] text-[var(--varo-agent-primary)]',
    status === 'completed' && 'border-[var(--varo-agent-success)] bg-[var(--varo-agent-success)] text-[var(--varo-agent-primary-foreground)]',
    status === 'failed' && 'border-[var(--varo-agent-danger)] bg-[var(--varo-agent-danger)] text-[var(--varo-agent-primary-foreground)]',
  )
}

function statusClass(status: AgentRagStep['status']) {
  return cn(
    'inline-flex min-h-[20px] items-center rounded-full px-2 text-[10px] font-bold',
    status === 'waiting' && 'bg-[var(--varo-agent-fill)] text-[var(--varo-agent-muted)]',
    status === 'running' && 'bg-[var(--varo-agent-primary-soft)] text-[var(--varo-agent-primary)]',
    status === 'completed' && 'bg-[var(--varo-agent-success-soft)] text-[var(--varo-agent-success)]',
    status === 'failed' && 'bg-[var(--varo-agent-danger-soft)] text-[var(--varo-agent-danger)]',
  )
}

const stageRows = computed(() => resolvedStages.value.map((stage, index) => ({
  ...stage,
  ariaLabel: `${stage.label}，${stage.statusLabel}${stage.durationLabel ? `，${stage.durationLabel}` : ''}`,
  connectorClass: cn(
    'agent-rag__connector-fill absolute inset-0 origin-top bg-[var(--varo-agent-success)]',
    stage.status === 'completed' && 'is-complete',
  ),
  hasConnector: index < resolvedStages.value.length - 1,
  iconStyle: stageIconStyles[stage.id],
  isAssemble: stage.id === 'assemble',
  isEmbed: stage.id === 'embed',
  isGenerate: stage.id === 'generate',
  isQuery: stage.id === 'query',
  isRetrieve: stage.id === 'retrieve',
  markerClass: markerClass(stage.status),
  rowClass: cn('agent-rag__stage grid min-w-0 grid-cols-[32px_minmax(0,1fr)] gap-2.5', index < resolvedStages.value.length - 1 && 'pb-4'),
  showDuration: stage.durationLabel.length > 0,
  statusClass: statusClass(stage.status),
  vectorClass: cn('agent-rag__vector relative grid grid-cols-[repeat(24,minmax(0,1fr))] gap-0.5 overflow-hidden py-1', stage.status === 'running' && 'is-running'),
})))

const sourceRows = computed(() => props.sources.map((source, index) => {
  const tone = getRagSourceTone(source)
  const selected = selectedSourceId.value === source.id
  const pinging = pingSourceIds.value.has(source.id)
  const hasExcerpt = typeof source.excerpt === 'string' && source.excerpt.length > 0
  const showScore = typeof source.score === 'number'
  const score = showScore ? Math.min(1, Math.max(0, source.score as number)) : 0
  const scoreLabel = showScore ? `${Math.round(score * 100)}%` : ''
  return {
    ariaLabel: `选择来源 ${index + 1}：${source.title}${scoreLabel ? `，相关度 ${scoreLabel}` : ''}`,
    badgeLabel: String(index + 1),
    className: cn(
      'agent-native-button agent-native-button--block agent-rag__source-button agent-rag__reveal box-border grid w-full min-w-0 grid-cols-[28px_minmax(0,1fr)] gap-2.5 rounded-xl border border-transparent bg-transparent px-2 py-2 text-left',
      toneClasses[tone],
      selected && 'is-highlighted border-[var(--agent-rag-source)] bg-[var(--agent-rag-source-soft)]',
      pinging && 'is-pinging',
    ),
    hasExcerpt,
    pinging,
    pressed: selected,
    scoreLabel,
    scoreStyle: { transform: `scaleX(${score})` },
    selected,
    showScore,
    source,
  }
}))

const useTokenWeights = computed(() => props.sources.length > 0 && props.sources.every((source) => {
  return typeof source.tokens === 'number' && Number.isFinite(source.tokens) && source.tokens > 0
}))

const assemblySegments = computed(() => props.sources.map((source, index) => {
  const tone = getRagSourceTone(source)
  const selected = selectedSourceId.value === source.id
  const pinging = pingSourceIds.value.has(source.id)
  const weight = useTokenWeights.value ? source.tokens as number : 1
  return {
    className: cn(
      'agent-rag__segment agent-rag__reveal grid h-8 min-w-5 place-items-center overflow-hidden rounded-md bg-[var(--agent-rag-source-soft)] text-[10px] font-bold tabular-nums text-[var(--agent-rag-source)]',
      toneClasses[tone],
      selected && 'is-highlighted',
      pinging && 'is-pinging',
    ),
    label: String(index + 1),
    sourceId: source.id,
    style: { flexGrow: String(weight) },
  }
}))

const answerParts = computed<AnswerPartView[]>(() => {
  const sourcesById = new Map(props.sources.map((source, index) => [source.id, { index, source }] as const))
  return props.answer.map((part) => {
    if (part.type === 'text') {
      return {
        ariaLabel: '',
        canSelect: false,
        className: 'agent-rag__answer-part agent-rag__answer-text whitespace-pre-wrap break-words text-[14px] leading-6 text-[var(--varo-agent-foreground)]',
        id: part.id,
        isText: true,
        label: '',
        pressed: false,
        sourceId: '',
        text: part.text,
      }
    }

    const match = sourcesById.get(part.sourceId)
    if (!match) {
      return {
        ariaLabel: `未找到引用来源：${part.sourceId}`,
        canSelect: false,
        className: 'agent-rag__answer-part agent-rag__citation agent-rag__citation--missing mx-0.5 inline-flex min-h-6 items-center rounded-md border border-[var(--varo-agent-border)] bg-[var(--varo-agent-fill)] px-1.5 text-[10px] font-bold text-[var(--varo-agent-muted)]',
        id: part.id,
        isText: false,
        label: '[?]',
        pressed: false,
        sourceId: part.sourceId,
        text: '',
      }
    }

    const tone = getRagSourceTone(match.source)
    const selected = selectedSourceId.value === part.sourceId
    return {
      ariaLabel: `选择来源 ${match.index + 1}：${match.source.title}`,
      canSelect: true,
      className: cn(
        'agent-native-button agent-rag__answer-part agent-rag__citation mx-0.5 inline-flex min-h-6 items-center rounded-md border border-[var(--agent-rag-source)] bg-[var(--agent-rag-source-soft)] px-1.5 text-[10px] font-bold tabular-nums text-[var(--agent-rag-source)]',
        toneClasses[tone],
        selected && 'is-highlighted',
      ),
      id: part.id,
      isText: false,
      label: `[${match.index + 1}]`,
      pressed: selected,
      source: match.source,
      sourceId: part.sourceId,
      text: '',
    }
  })
})

const footerActionLabel = computed(() => {
  if (anyRunning.value) { return '停止' }
  if (hasFailure.value) { return '重试流程' }
  if (allCompleted.value) { return '重新运行' }
  return '运行流程'
})

const footerStatusLabel = computed(() => {
  if (anyRunning.value) { return `流程运行中，已完成 ${completedCount.value}/5` }
  if (hasFailure.value) { return `流程失败，已完成 ${completedCount.value}/5` }
  if (allCompleted.value) { return '流程已完成，5/5' }
  return `流程等待运行，已完成 ${completedCount.value}/5`
})

function handleAction() {
  if (anyRunning.value) {
    emit('cancel')
    return
  }
  resetLocalState()
  emit('run')
}

watch(
  () => props.answer,
  (answer) => {
    if (answer.length === 0) {
      clearPing()
      selectedSourceId.value = ''
      observedCitationSources = new Map()
      return
    }

    const nextCitationSources = collectCitationSources(answer)
    const citedSourceIds = new Set<string>()
    const newSourceIds = new Set<string>()
    for (const [partId, sourceId] of nextCitationSources) {
      citedSourceIds.add(sourceId)
      if (observedCitationSources.get(partId) !== sourceId) {
        newSourceIds.add(sourceId)
      }
    }
    for (const [partId, sourceId] of observedCitationSources) {
      if (nextCitationSources.get(partId) !== sourceId && !citedSourceIds.has(sourceId)) {
        clearSourcePing(sourceId)
      }
    }
    observedCitationSources = nextCitationSources
    for (const sourceId of newSourceIds) { triggerPing(sourceId) }
  },
  { deep: true },
)

watch(overallStatus, (status, previousStatus) => {
  if (status === 'waiting' && previousStatus !== undefined && previousStatus !== 'waiting') {
    resetLocalState()
  }
})

watch(
  () => props.sources.map(source => source.id),
  () => {
    if (selectedSourceId.value && !props.sources.some(source => source.id === selectedSourceId.value)) {
      selectedSourceId.value = ''
    }
    for (const sourceId of pingTimers.keys()) {
      if (!props.sources.some(source => source.id === sourceId)) { clearSourcePing(sourceId) }
    }
  },
)

watch(() => props.reducedMotion, (reducedMotion) => {
  if (reducedMotion) { clearPing() }
})

onBeforeUnmount(clearPing)
</script>

<template>
  <view :class="rootClass" :data-status="overallStatus">
    <view class="flex min-h-12 min-w-0 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="min-w-0 break-words text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text v-if="showElapsed" class="flex-none text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ elapsedLabel }}
      </text>
    </view>

    <view class="grid min-w-0 p-3">
      <view
        v-for="stage in stageRows"
        :key="stage.id"
        :class="stage.rowClass"
        :data-rag-stage="stage.id"
        :data-status="stage.status"
        role="group"
        :aria-label="stage.ariaLabel"
      >
        <view class="relative flex min-h-full justify-center">
          <view :class="stage.markerClass" aria-hidden="true">
            <view class="h-4 w-4 bg-current" :style="stage.iconStyle" />
          </view>
          <view v-if="stage.hasConnector" class="agent-rag__connector absolute bottom-[-16px] left-1/2 top-8 w-px -translate-x-1/2 overflow-hidden bg-[var(--varo-agent-border)]" aria-hidden="true">
            <view :class="stage.connectorClass" />
          </view>
        </view>

        <view class="grid min-w-0 gap-2 pt-1">
          <view class="flex min-w-0 items-start justify-between gap-2">
            <view class="grid min-w-0 gap-0.5">
              <text class="break-words text-[12px] font-bold text-[var(--varo-agent-foreground)]">
                {{ stage.label }}
              </text>
              <text class="break-words text-[11px] leading-4 text-[var(--varo-agent-muted)]">
                {{ stage.detail }}
              </text>
            </view>
            <view class="grid flex-none justify-items-end gap-0.5">
              <text :class="stage.statusClass">
                {{ stage.statusLabel }}
              </text>
              <text v-if="stage.showDuration" class="text-[10px] tabular-nums text-[var(--varo-agent-muted)]">
                {{ stage.durationLabel }}
              </text>
            </view>
          </view>

          <view v-if="stage.isQuery" class="min-w-0 py-1">
            <text v-if="hasQuery" class="whitespace-pre-wrap break-words text-[14px] leading-6 text-[var(--varo-agent-foreground)]">
              {{ query }}
            </text>
            <text v-else class="text-[11px] text-[var(--varo-agent-muted)]">
              尚未提供查询
            </text>
          </view>

          <view v-if="stage.isEmbed" :class="stage.vectorClass" aria-hidden="true">
            <text v-for="cell in VECTOR_CELLS" :key="cell" class="h-1.5 min-w-0 rounded-full bg-[var(--varo-agent-border-strong)]" />
            <text class="agent-rag__vector-scan pointer-events-none absolute bottom-0 top-0 bg-[var(--varo-agent-primary-soft)] opacity-0" />
          </view>

          <view v-if="stage.isRetrieve" class="grid min-w-0 gap-1.5">
            <button
              v-for="entry in sourceRows"
              :key="entry.source.id"
              :class="entry.className"
              type="button"
              :data-rag-source="entry.source.id"
              :aria-label="entry.ariaLabel"
              :aria-pressed="entry.pressed"
              hover-class="agent-rag__button--pressed"
              :hover-start-time="20"
              :hover-stay-time="70"
              @click="selectSource(entry.source)"
            >
              <text class="grid h-7 w-7 place-items-center rounded-full bg-[var(--agent-rag-source-soft)] text-[10px] font-bold tabular-nums text-[var(--agent-rag-source)]">
                {{ entry.badgeLabel }}
              </text>
              <view class="grid min-w-0 gap-1">
                <view class="flex min-w-0 items-start justify-between gap-2">
                  <text class="min-w-0 flex-1 break-words text-[12px] font-semibold leading-4 text-[var(--varo-agent-foreground)]">
                    {{ entry.source.title }}
                  </text>
                  <text v-if="entry.selected" class="flex-none text-[10px] font-bold text-[var(--agent-rag-source)]">
                    已选择
                  </text>
                </view>
                <text v-if="entry.hasExcerpt" class="whitespace-pre-wrap break-words text-[11px] leading-4 text-[var(--varo-agent-muted)]">
                  {{ entry.source.excerpt }}
                </text>
                <view v-if="entry.showScore" class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <view class="h-1 overflow-hidden rounded-full bg-[var(--varo-agent-border)]" aria-hidden="true">
                    <view class="agent-rag__score-fill h-full origin-left rounded-full bg-[var(--agent-rag-source)]" :style="entry.scoreStyle" />
                  </view>
                  <text class="text-[10px] tabular-nums text-[var(--varo-agent-muted)]">
                    {{ entry.scoreLabel }}
                  </text>
                </view>
              </view>
            </button>
            <view v-if="sourceRows.length === 0" class="grid min-h-14 place-items-center rounded-lg border border-dashed border-[var(--varo-agent-border)] px-3 text-center">
              <text class="text-[11px] text-[var(--varo-agent-muted)]">
                暂无检索来源
              </text>
            </view>
          </view>

          <view v-if="stage.isAssemble" class="grid min-w-0 gap-1.5">
            <view v-if="assemblySegments.length" class="flex min-w-0 gap-1 rounded-lg bg-[var(--varo-agent-fill)] p-1.5" role="img" aria-label="上下文来源组成">
              <view
                v-for="segment in assemblySegments"
                :key="segment.sourceId"
                :class="segment.className"
                :style="segment.style"
                :data-rag-segment="segment.sourceId"
                aria-hidden="true"
              >
                <text>{{ segment.label }}</text>
              </view>
            </view>
            <view v-else class="grid min-h-12 place-items-center rounded-lg border border-dashed border-[var(--varo-agent-border)] px-3 text-center">
              <text class="text-[11px] text-[var(--varo-agent-muted)]">
                暂无可组装的来源
              </text>
            </view>
          </view>

          <view v-if="stage.isGenerate" class="min-w-0 py-1">
            <view v-if="answerParts.length" class="agent-rag__answer min-w-0 break-words">
              <template v-for="part in answerParts" :key="part.id">
                <text v-if="part.isText" :class="part.className">
                  {{ part.text }}
                </text>
                <button
                  v-else-if="part.canSelect"
                  :class="part.className"
                  type="button"
                  :data-rag-citation="part.sourceId"
                  :aria-label="part.ariaLabel"
                  :aria-pressed="part.pressed"
                  hover-class="agent-rag__button--pressed"
                  :hover-start-time="20"
                  :hover-stay-time="70"
                  @click="selectCitation(part)"
                >
                  {{ part.label }}
                </button>
                <text
                  v-else
                  :class="part.className"
                  :data-rag-citation="part.sourceId"
                  :aria-label="part.ariaLabel"
                >
                  {{ part.label }}
                </text>
              </template>
              <text v-if="stage.status === 'running'" class="agent-rag__cursor ml-0.5 inline-block h-4 w-px align-middle bg-[var(--varo-agent-primary)]" aria-hidden="true" />
            </view>
            <view v-else class="flex min-h-8 items-center">
              <text class="text-[11px] text-[var(--varo-agent-muted)]">
                尚未生成回答
              </text>
              <text v-if="stage.status === 'running'" class="agent-rag__cursor ml-1 inline-block h-4 w-px bg-[var(--varo-agent-primary)]" aria-hidden="true" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="flex min-h-14 min-w-0 items-center justify-between gap-3 border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-[13px] py-2">
      <view class="min-w-0" role="status" aria-live="polite" aria-atomic="true">
        <text class="break-words text-[11px] text-[var(--varo-agent-muted)]">
          {{ footerStatusLabel }}
        </text>
      </view>
      <button
        class="agent-native-button agent-rag__action inline-flex min-h-9 flex-none items-center justify-center rounded-lg border border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] px-3 text-[11px] font-bold text-[var(--varo-agent-primary-foreground)]"
        type="button"
        :aria-label="footerActionLabel"
        hover-class="agent-rag__action--pressed"
        :hover-start-time="20"
        :hover-stay-time="70"
        @click="handleAction"
      >
        {{ footerActionLabel }}
      </button>
    </view>
  </view>
</template>

<style>
.agent-rag__connector-fill {
  transform: scaleY(0);
  transition: transform var(--varo-agent-motion-enter) var(--varo-agent-motion-ease);
}

.agent-rag__connector-fill.is-complete {
  transform: scaleY(1);
}

.agent-rag__marker.is-running {
  animation: agent-rag-stage-prompt var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease) both;
}

.agent-rag__vector-scan {
  left: 0;
  width: 20%;
  transform: translateX(-120%);
}

.agent-rag__vector.is-running .agent-rag__vector-scan {
  opacity: 0.62;
  animation: agent-rag-vector-scan var(--varo-agent-motion-loop) linear infinite;
}

.agent-rag__reveal,
.agent-rag__answer-part {
  animation: agent-rag-reveal var(--varo-agent-motion-enter) var(--varo-agent-motion-ease) both;
}

.agent-rag__score-fill {
  transition: transform var(--varo-agent-motion-enter) var(--varo-agent-motion-ease);
  animation: agent-rag-score-enter var(--varo-agent-motion-enter) var(--varo-agent-motion-ease) backwards;
}

.agent-rag__segment {
  flex-basis: 0;
  transition:
    color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    background-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    box-shadow var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
}

.agent-rag__source-button,
.agent-rag__citation {
  transition:
    color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    background-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    border-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    box-shadow var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
}

.agent-rag__source-button.is-highlighted,
.agent-rag__source-button:focus,
.agent-rag__citation.is-highlighted,
.agent-rag__citation:focus,
.agent-rag__segment.is-highlighted {
  box-shadow:
    0 0 0 2px var(--agent-rag-source-soft),
    0 0 0 3px var(--agent-rag-source);
}

.agent-rag__source-button.is-pinging,
.agent-rag__segment.is-pinging {
  animation: agent-rag-ping var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease) 2;
}

.agent-rag__cursor {
  animation: agent-rag-cursor var(--varo-agent-motion-loop) steps(2, end) infinite;
}

/* Native button defaults otherwise override component margins. */
.agent-rag__source-button.agent-rag__source-button,
.agent-rag__citation.agent-rag__citation,
.agent-rag__action.agent-rag__action {
  box-sizing: border-box;
  line-height: inherit;
}

.agent-rag__source-button.agent-rag__source-button,
.agent-rag__action.agent-rag__action {
  margin: 0;
}

.agent-rag__citation.agent-rag__citation {
  margin: 0 2px;
}

.agent-rag__citation {
  vertical-align: baseline;
}

.agent-rag__source-button::after,
.agent-rag__citation::after,
.agent-rag__action::after {
  border: 0;
}

.agent-rag__button--pressed {
  opacity: 0.78;
}

.agent-rag__action--pressed {
  opacity: 0.82;
}

@keyframes agent-rag-stage-prompt {
  0% {
    box-shadow: 0 0 0 0 var(--varo-agent-primary-soft);
  }

  70% {
    box-shadow: 0 0 0 4px var(--varo-agent-primary-soft);
  }

  100% {
    box-shadow: 0 0 0 3px var(--varo-agent-primary-soft);
  }
}

@keyframes agent-rag-vector-scan {
  to {
    transform: translateX(600%);
  }
}

@keyframes agent-rag-score-enter {
  from {
    transform: scaleX(0);
  }
}

@keyframes agent-rag-reveal {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes agent-rag-ping {
  45% {
    box-shadow:
      0 0 0 5px var(--agent-rag-source-soft),
      0 0 0 2px var(--agent-rag-source);
  }
}

@keyframes agent-rag-cursor {
  50% {
    opacity: 0.18;
  }
}

.agent-rag--reduced-motion .agent-rag__connector-fill,
.agent-rag--reduced-motion .agent-rag__score-fill,
.agent-rag--reduced-motion .agent-rag__segment,
.agent-rag--reduced-motion .agent-rag__source-button,
.agent-rag--reduced-motion .agent-rag__citation {
  transition: none;
}

.agent-rag--reduced-motion .agent-rag__marker,
.agent-rag--reduced-motion .agent-rag__score-fill,
.agent-rag--reduced-motion .agent-rag__reveal,
.agent-rag--reduced-motion .agent-rag__answer-part,
.agent-rag--reduced-motion .agent-rag__source-button.is-pinging,
.agent-rag--reduced-motion .agent-rag__segment.is-pinging,
.agent-rag--reduced-motion .agent-rag__cursor {
  animation: none;
}

.agent-rag--reduced-motion .agent-rag__vector.is-running .agent-rag__vector-scan {
  opacity: 0;
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .agent-rag__connector-fill,
  .agent-rag__score-fill,
  .agent-rag__segment,
  .agent-rag__source-button,
  .agent-rag__citation {
    transition: none;
  }

  .agent-rag__marker,
  .agent-rag__score-fill,
  .agent-rag__reveal,
  .agent-rag__answer-part,
  .agent-rag__source-button.is-pinging,
  .agent-rag__segment.is-pinging,
  .agent-rag__cursor {
    animation: none;
  }

  .agent-rag__vector.is-running .agent-rag__vector-scan {
    opacity: 0;
    animation: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
