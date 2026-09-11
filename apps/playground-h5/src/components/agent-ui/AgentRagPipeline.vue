<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type {
  AgentRagAnswerPart,
  AgentRagPipelineProps,
  AgentRagSource,
  AgentRagStageId,
} from './rag-pipeline'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { cn } from '../../lib/cn'
import { agentRagIcons } from './rag-icons'
import { getRagSourceTone, resolveRagSteps } from './rag-pipeline'

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

type OverallStatus = 'waiting' | 'running' | 'completed' | 'failed'

interface SourceEntry {
  number: number
  scorePercent: number | undefined
  scoreStyle: CSSProperties | undefined
  segmentStyle: CSSProperties
  selectLabel: string
  source: AgentRagSource
  toneClass: string
}

type AnswerEntry
  = | { id: string, text: string, type: 'text' }
    | {
      displayLabel: string
      id: string
      selectLabel: string
      source: SourceEntry | undefined
      sourceId: string
      type: 'citation'
    }

const vectorCells = Array.from({ length: 24 }, (_, index) => `vector-${index + 1}`)
const PING_CLEAR_MS = 400

const hoveredSourceId = shallowRef<string | null>(null)
const focusedSourceId = shallowRef<string | null>(null)
const selectedSourceId = shallowRef<string | null>(null)
const pingingSourceIds = shallowRef<ReadonlySet<string>>(new Set())
const pingTimers = new Map<string, () => void>()

const resolvedSteps = computed(() => resolveRagSteps(props.steps))
const completedCount = computed(() =>
  resolvedSteps.value.filter(step => step.status === 'completed').length,
)
const isRunning = computed(() => resolvedSteps.value.some(step => step.status === 'running'))
const isCompleted = computed(() => resolvedSteps.value.every(step => step.status === 'completed'))
const hasFailed = computed(() => resolvedSteps.value.some(step => step.status === 'failed'))
const hasProgress = computed(() => completedCount.value > 0)

const overallStatus = computed<OverallStatus>(() => {
  if (isRunning.value) { return 'running' }
  if (hasFailed.value) { return 'failed' }
  if (isCompleted.value) { return 'completed' }
  return 'waiting'
})

const activeSourceId = computed(() =>
  hoveredSourceId.value ?? focusedSourceId.value ?? selectedSourceId.value,
)

const rootClass = computed(() =>
  cn(
    'agent-rag w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-foreground)] shadow-sm',
    props.reducedMotion && 'is-reduced-motion',
    props.className,
  ),
)

function stageStatusClass(status: OverallStatus) {
  if (status === 'running') {
    return 'bg-[var(--varo-agent-primary-soft)] text-[var(--varo-agent-primary)]'
  }
  if (status === 'completed') {
    return 'bg-[var(--varo-agent-success-soft)] text-[var(--varo-agent-success)]'
  }
  if (status === 'failed') {
    return 'bg-[var(--varo-agent-danger-soft)] text-[var(--varo-agent-danger)]'
  }
  return 'bg-[var(--varo-agent-fill)] text-[var(--varo-agent-muted)]'
}

function stageIconStyle(id: AgentRagStageId): CSSProperties {
  const mask = `url("${agentRagIcons[id]}")`
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
  }
}

const stageEntries = computed(() =>
  resolvedSteps.value.map((step, index) => ({
    ...step,
    iconStyle: stageIconStyle(step.id),
    isLast: index === resolvedSteps.value.length - 1,
    statusClass: stageStatusClass(step.status),
  })),
)

const useTokenWeights = computed(() => props.sources.length > 0 && props.sources.every((source) => {
  return typeof source.tokens === 'number' && Number.isFinite(source.tokens) && source.tokens > 0
}))

const sourceEntries = computed<readonly SourceEntry[]>(() =>
  props.sources.map((source, index) => {
    const tone = getRagSourceTone(source)
    const normalizedScore = source.score === undefined
      ? undefined
      : Math.min(1, Math.max(0, source.score))
    const scorePercent = normalizedScore === undefined
      ? undefined
      : Math.round(normalizedScore * 100)
    const segmentWeight = useTokenWeights.value ? source.tokens as number : 1

    return {
      number: index + 1,
      scorePercent,
      scoreStyle: normalizedScore === undefined
        ? undefined
        : { transform: `scaleX(${normalizedScore})` },
      segmentStyle: { flexBasis: '0%', flexGrow: segmentWeight },
      selectLabel: `选择来源 ${index + 1}：${source.title}`,
      source,
      toneClass: `agent-rag--tone-${tone}`,
    }
  }),
)

const sourceById = computed(() => {
  const entries = new Map<string, SourceEntry>()
  for (const entry of sourceEntries.value) {
    entries.set(entry.source.id, entry)
  }
  return entries
})

const answerEntries = computed<readonly AnswerEntry[]>(() =>
  props.answer.map((part) => {
    if (part.type === 'text') {
      return { id: part.id, text: part.text, type: 'text' }
    }

    const source = sourceById.value.get(part.sourceId)
    return {
      displayLabel: source ? `[${source.number}]` : '[?]',
      id: part.id,
      selectLabel: source ? `选择来源 ${source.number}：${source.source.title}` : `未找到引用来源：${part.sourceId}`,
      source,
      sourceId: part.sourceId,
      type: 'citation',
    }
  }),
)

const generateStatus = computed(() => resolvedSteps.value[resolvedSteps.value.length - 1]!.status)
const emptyAnswerLabel = computed(() => {
  if (generateStatus.value === 'running') { return '正在生成回答' }
  if (generateStatus.value === 'failed') { return '回答生成失败' }
  if (generateStatus.value === 'completed') { return '本次流程没有返回回答' }
  return '等待生成回答'
})

const elapsedLabel = computed(() => {
  if (props.elapsedMs === undefined) { return '' }
  const elapsed = Math.max(0, props.elapsedMs)
  if (elapsed < 1000) { return `${Math.round(elapsed)} ms` }
  return `${(elapsed / 1000).toFixed(1)} s`
})

const actionLabel = computed(() => {
  if (isRunning.value) { return '停止' }
  if (hasFailed.value) { return '重试流程' }
  if (isCompleted.value) { return '重新运行' }
  return '运行流程'
})

const actionClass = computed(() =>
  cn(
    'agent-rag__action inline-flex min-h-10 flex-none items-center justify-center rounded-xl border px-3.5 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--varo-agent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--varo-agent-surface)]',
    isRunning.value
      ? 'border-[var(--varo-agent-danger)] bg-[var(--varo-agent-danger-soft)] text-[var(--varo-agent-danger)] hover:bg-[var(--varo-agent-surface-strong)]'
      : 'border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] text-[var(--varo-agent-primary-foreground)] hover:opacity-90',
  ),
)

const footerStatusLabel = computed(() => {
  if (isRunning.value) { return `处理中，${completedCount.value}/5 已完成` }
  if (hasFailed.value) { return '流程失败，可重试' }
  if (isCompleted.value) { return '流程已完成' }
  if (hasProgress.value) { return `流程已停止，${completedCount.value}/5 已完成` }
  return '等待运行'
})

const liveStatus = computed(() => {
  if (isRunning.value) { return `检索增强生成流程处理中，${completedCount.value} 个阶段已完成` }
  if (hasFailed.value) { return '检索增强生成流程失败，可以重试' }
  if (isCompleted.value) { return '检索增强生成流程已完成' }
  if (hasProgress.value) { return '检索增强生成流程已停止' }
  return '检索增强生成流程等待运行'
})

const footerDotClass = computed(() => {
  if (overallStatus.value === 'running') { return 'bg-[var(--varo-agent-primary)]' }
  if (overallStatus.value === 'failed') { return 'bg-[var(--varo-agent-danger)]' }
  if (overallStatus.value === 'completed') { return 'bg-[var(--varo-agent-success)]' }
  return 'bg-[var(--varo-agent-border-strong)]'
})

function collectCitationMappings(answer: readonly AgentRagAnswerPart[]) {
  const mappings = new Map<string, string>()
  for (const part of answer) {
    if (part.type === 'citation') { mappings.set(part.id, part.sourceId) }
  }
  return mappings
}

let seenCitationMappings = collectCitationMappings(props.answer)

function clearAllPings() {
  for (const cancel of pingTimers.values()) {
    cancel()
  }
  pingTimers.clear()
  if (pingingSourceIds.value.size > 0) {
    pingingSourceIds.value = new Set()
  }
}

function removeSourcePing(sourceId: string) {
  const cancel = pingTimers.get(sourceId)
  if (cancel) {
    cancel()
    pingTimers.delete(sourceId)
  }
  if (!pingingSourceIds.value.has(sourceId)) { return }
  const next = new Set(pingingSourceIds.value)
  next.delete(sourceId)
  pingingSourceIds.value = next
}

function pingSource(sourceId: string) {
  if (props.reducedMotion || !sourceById.value.has(sourceId)) { return }
  pingTimers.get(sourceId)?.()

  if (!pingingSourceIds.value.has(sourceId)) {
    const next = new Set(pingingSourceIds.value)
    next.add(sourceId)
    pingingSourceIds.value = next
  }

  const timer = setTimeout(() => {
    pingTimers.delete(sourceId)
    if (!pingingSourceIds.value.has(sourceId)) { return }
    const next = new Set(pingingSourceIds.value)
    next.delete(sourceId)
    pingingSourceIds.value = next
  }, PING_CLEAR_MS)
  pingTimers.set(sourceId, () => clearTimeout(timer))
}

function clearInteractionState() {
  hoveredSourceId.value = null
  focusedSourceId.value = null
  selectedSourceId.value = null
}

function resetEphemeralState() {
  clearAllPings()
  clearInteractionState()
  seenCitationMappings = collectCitationMappings(props.answer)
}

function setHoveredSource(sourceId: string) {
  if (!sourceById.value.has(sourceId)) { return }
  hoveredSourceId.value = sourceId
}

function clearHoveredSource(sourceId: string) {
  if (hoveredSourceId.value === sourceId) { hoveredSourceId.value = null }
}

function setFocusedSource(sourceId: string) {
  hoveredSourceId.value = null
  focusedSourceId.value = sourceId
}

function clearFocusedSource(sourceId: string) {
  if (focusedSourceId.value === sourceId) { focusedSourceId.value = null }
}

function selectSource(entry: SourceEntry | undefined) {
  if (!entry) { return }
  hoveredSourceId.value = null
  focusedSourceId.value = null
  selectedSourceId.value = entry.source.id
  emit('selectSource', entry.source)
}

function handleAction() {
  resetEphemeralState()
  if (isRunning.value) {
    emit('cancel')
    return
  }
  emit('run')
}

watch(
  () => props.answer,
  (answer) => {
    const nextCitationMappings = collectCitationMappings(answer)
    const nextSourceIds = new Set<string>()
    const newlyMappedSourceIds = new Set<string>()

    for (const [partId, sourceId] of nextCitationMappings) {
      nextSourceIds.add(sourceId)
      if (seenCitationMappings.get(partId) !== sourceId) {
        newlyMappedSourceIds.add(sourceId)
      }
    }

    if (answer.length === 0) {
      clearAllPings()
    }
    else {
      for (const [partId, sourceId] of seenCitationMappings) {
        if (nextCitationMappings.get(partId) === sourceId) { continue }
        if (!nextSourceIds.has(sourceId)) { removeSourcePing(sourceId) }
      }
    }
    seenCitationMappings = nextCitationMappings

    for (const sourceId of newlyMappedSourceIds) {
      pingSource(sourceId)
    }
  },
  { deep: true },
)

watch(
  () => props.sources,
  (sources) => {
    const availableSourceIds = new Set(sources.map(source => source.id))
    if (hoveredSourceId.value !== null && !availableSourceIds.has(hoveredSourceId.value)) {
      hoveredSourceId.value = null
    }
    if (focusedSourceId.value !== null && !availableSourceIds.has(focusedSourceId.value)) {
      focusedSourceId.value = null
    }
    if (selectedSourceId.value !== null && !availableSourceIds.has(selectedSourceId.value)) {
      selectedSourceId.value = null
    }
    for (const sourceId of pingTimers.keys()) {
      if (!availableSourceIds.has(sourceId)) { removeSourcePing(sourceId) }
    }
  },
  { deep: true },
)

watch(overallStatus, (status, previousStatus) => {
  if (status === 'waiting' && previousStatus !== 'waiting') {
    resetEphemeralState()
  }
})

watch(() => props.reducedMotion, (reduced) => {
  if (reduced) { clearAllPings() }
})

onBeforeUnmount(clearAllPings)
</script>

<template>
  <section
    :class="rootClass"
    :data-status="overallStatus"
    :aria-busy="isRunning"
    :aria-label="title"
  >
    <header class="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-4 py-3">
      <h3 class="m-0 min-w-0 text-[13px] font-bold leading-5 text-[var(--varo-agent-foreground)]">
        {{ title }}
      </h3>
      <span
        v-if="elapsedLabel"
        class="flex-none text-[11px] font-semibold tabular-nums text-[var(--varo-agent-muted)]"
        :aria-label="`总耗时 ${elapsedLabel}`"
      >
        {{ elapsedLabel }}
      </span>
      <p class="sr-only" aria-atomic="true" aria-live="polite">
        {{ liveStatus }}
      </p>
    </header>

    <ol class="m-0 grid list-none p-4">
      <li
        v-for="stage in stageEntries"
        :key="stage.id"
        class="agent-rag__stage relative grid min-w-0 grid-cols-[34px_minmax(0,1fr)] gap-x-3 pb-4 last:pb-0"
        :data-rag-stage="stage.id"
        :data-status="stage.status"
      >
        <span class="agent-rag__rail relative flex justify-center" aria-hidden="true">
          <span v-if="!stage.isLast" class="agent-rag__connector">
            <span class="agent-rag__connector-fill" />
          </span>
          <span class="agent-rag__marker">
            <span class="agent-rag__stage-icon" :style="stage.iconStyle" />
          </span>
        </span>

        <section class="min-w-0 pb-0.5" :aria-label="stage.label">
          <div class="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <strong class="min-w-0 text-[12px] font-bold leading-[18px] text-[var(--varo-agent-foreground)]">
              {{ stage.label }}
            </strong>
            <span class="flex flex-none items-center gap-2">
              <small
                v-if="stage.durationLabel"
                class="text-[10px] tabular-nums text-[var(--varo-agent-muted)]"
              >
                {{ stage.durationLabel }}
              </small>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold leading-4" :class="stage.statusClass">
                {{ stage.statusLabel }}
              </span>
            </span>
          </div>
          <p class="m-0 mt-0.5 text-[11px] leading-4 text-[var(--varo-agent-muted)]">
            {{ stage.detail }}
          </p>

          <div v-if="stage.id === 'query'" class="agent-rag__panel mt-2.5">
            <p
              v-if="query"
              class="agent-rag__query m-0 whitespace-pre-wrap break-words text-[14px] leading-6 text-[var(--varo-agent-text)]"
            >
              {{ query }}
            </p>
            <p v-else class="m-0 text-[11px] text-[var(--varo-agent-muted)]">
              尚未提供查询
            </p>
          </div>

          <div v-else-if="stage.id === 'embed'" class="agent-rag__panel mt-2.5">
            <span
              class="agent-rag__vector"
              :class="{ 'is-running': stage.status === 'running' }"
              aria-hidden="true"
            >
              <span v-for="cell in vectorCells" :key="cell" class="agent-rag__vector-cell" />
              <span class="agent-rag__vector-scan" />
            </span>
          </div>

          <div v-else-if="stage.id === 'retrieve'" class="mt-2.5">
            <ul v-if="sourceEntries.length" class="m-0 grid list-none gap-2 p-0">
              <li v-for="entry in sourceEntries" :key="entry.source.id" class="min-w-0">
                <button
                  class="agent-rag__source w-full min-w-0 rounded-xl border border-transparent bg-transparent p-2 text-left"
                  :class="[
                    entry.toneClass,
                    {
                      'is-highlighted': activeSourceId === entry.source.id,
                      'is-pinging': pingingSourceIds.has(entry.source.id),
                    },
                  ]"
                  type="button"
                  :aria-label="entry.selectLabel"
                  :aria-pressed="selectedSourceId === entry.source.id"
                  :data-rag-source="entry.source.id"
                  @mouseenter="setHoveredSource(entry.source.id)"
                  @mousemove="setHoveredSource(entry.source.id)"
                  @mouseleave="clearHoveredSource(entry.source.id)"
                  @focus="setFocusedSource(entry.source.id)"
                  @blur="clearFocusedSource(entry.source.id)"
                  @click="selectSource(entry)"
                >
                  <span class="agent-rag__source-layout">
                    <span class="agent-rag__source-number">{{ entry.number }}</span>
                    <span class="grid min-w-0 gap-1">
                      <span class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                        <strong class="agent-rag__source-title min-w-0 flex-1 text-[12px] font-semibold leading-[18px]">
                          {{ entry.source.title }}
                        </strong>
                        <small
                          v-if="selectedSourceId === entry.source.id"
                          class="agent-rag__selected-label flex-none text-[10px] font-bold"
                        >
                          已选
                        </small>
                      </span>
                      <span
                        v-if="entry.source.excerpt"
                        class="agent-rag__source-excerpt text-[11px] leading-4"
                      >
                        {{ entry.source.excerpt }}
                      </span>
                      <span v-if="entry.scorePercent !== undefined" class="mt-0.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <span
                          class="agent-rag__score-track"
                          role="progressbar"
                          aria-label="来源相关度"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          :aria-valuenow="entry.scorePercent"
                        >
                          <span class="agent-rag__score-fill" :style="entry.scoreStyle" />
                        </span>
                        <span class="text-[10px] font-semibold tabular-nums text-[var(--varo-agent-muted)]">{{ entry.scorePercent }}%</span>
                      </span>
                    </span>
                  </span>
                  <span class="agent-rag__ping-ring" aria-hidden="true" />
                </button>
              </li>
            </ul>
            <p v-else class="agent-rag__panel m-0 text-[11px] text-[var(--varo-agent-muted)]">
              暂无检索来源
            </p>
          </div>

          <div v-else-if="stage.id === 'assemble'" class="mt-2.5">
            <ol
              v-if="sourceEntries.length"
              class="agent-rag__segments m-0 flex list-none p-0"
              aria-label="来源上下文构成"
            >
              <li
                v-for="entry in sourceEntries"
                :key="entry.source.id"
                class="agent-rag__segment"
                :class="[
                  entry.toneClass,
                  {
                    'is-highlighted': activeSourceId === entry.source.id,
                    'is-pinging': pingingSourceIds.has(entry.source.id),
                  },
                ]"
                :style="entry.segmentStyle"
                :title="`来源 ${entry.number}：${entry.source.title}`"
              >
                <span class="agent-rag__segment-number" aria-hidden="true">{{ entry.number }}</span>
                <span class="sr-only">来源 {{ entry.number }}：{{ entry.source.title }}</span>
                <span class="agent-rag__ping-ring" aria-hidden="true" />
              </li>
            </ol>
            <p v-else class="agent-rag__panel m-0 text-[11px] text-[var(--varo-agent-muted)]">
              暂无可组装来源
            </p>
          </div>

          <div v-else class="agent-rag__panel mt-2.5">
            <p
              v-if="answerEntries.length"
              class="agent-rag__answer m-0 text-[14px] leading-6 text-[var(--varo-agent-foreground)]"
              aria-label="生成回答"
            >
              <template v-for="part in answerEntries" :key="part.id">
                <span v-if="part.type === 'text'" class="agent-rag__answer-text">{{ part.text }}</span>
                <button
                  v-else
                  class="agent-rag__citation"
                  :class="[
                    part.source?.toneClass ?? 'agent-rag__citation--missing',
                    { 'is-highlighted': activeSourceId === part.sourceId },
                  ]"
                  type="button"
                  :disabled="!part.source"
                  :aria-label="part.selectLabel"
                  :aria-pressed="selectedSourceId === part.sourceId"
                  :data-rag-citation="part.sourceId"
                  @mouseenter="setHoveredSource(part.sourceId)"
                  @mousemove="setHoveredSource(part.sourceId)"
                  @mouseleave="clearHoveredSource(part.sourceId)"
                  @focus="setFocusedSource(part.sourceId)"
                  @blur="clearFocusedSource(part.sourceId)"
                  @click="selectSource(part.source)"
                >
                  {{ part.displayLabel }}
                </button>
              </template>
              <span v-if="stage.status === 'running'" class="agent-rag__cursor" aria-hidden="true" />
            </p>
            <p v-else class="m-0 text-[11px] text-[var(--varo-agent-muted)]">
              {{ emptyAnswerLabel }}<span v-if="stage.status === 'running'" class="agent-rag__cursor" aria-hidden="true" />
            </p>
          </div>
        </section>
      </li>
    </ol>

    <footer class="flex min-h-14 flex-wrap items-center justify-between gap-3 border-t border-[var(--varo-agent-border)] px-4 py-2.5">
      <span class="inline-flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[var(--varo-agent-text)]">
        <span class="h-2 w-2 flex-none rounded-full" :class="footerDotClass" aria-hidden="true" />
        <span>{{ footerStatusLabel }}</span>
      </span>
      <button :class="actionClass" type="button" @click="handleAction">
        {{ actionLabel }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.agent-rag__action {
  transition:
    background-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    border-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
}

.agent-rag__stage {
  isolation: isolate;
}

.agent-rag__rail {
  align-self: stretch;
}

.agent-rag__connector {
  position: absolute;
  top: 32px;
  bottom: -16px;
  left: 50%;
  z-index: -1;
  width: 2px;
  overflow: hidden;
  background: var(--varo-agent-border);
  border-radius: 999px;
  transform: translateX(-50%);
}

.agent-rag__connector-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--varo-agent-success);
  border-radius: inherit;
  transform: scaleY(0);
  transform-origin: top;
  transition: transform var(--varo-agent-motion-enter) var(--varo-agent-motion-ease);
}

.agent-rag__stage[data-status='completed'] .agent-rag__connector-fill {
  transform: scaleY(1);
}

.agent-rag__marker {
  position: relative;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--varo-agent-muted);
  background: var(--varo-agent-surface);
  border: 1px solid var(--varo-agent-border);
  border-radius: 10px;
  transition:
    color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    background-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    border-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    box-shadow var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
}

.agent-rag__stage[data-status='running'] .agent-rag__marker {
  color: var(--varo-agent-primary);
  background: var(--varo-agent-primary-soft);
  border-color: var(--varo-agent-primary);
  animation: varo-agent-rag-active var(--varo-agent-motion-loop) var(--varo-agent-motion-ease) infinite;
}

.agent-rag__stage[data-status='completed'] .agent-rag__marker {
  color: var(--varo-agent-success);
  background: var(--varo-agent-success-soft);
  border-color: var(--varo-agent-success);
}

.agent-rag__stage[data-status='failed'] .agent-rag__marker {
  color: var(--varo-agent-danger);
  background: var(--varo-agent-danger-soft);
  border-color: var(--varo-agent-danger);
}

.agent-rag__stage-icon {
  display: block;
  width: 16px;
  height: 16px;
  background: currentcolor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.agent-rag__panel {
  min-width: 0;
  padding: 4px 0;
}

.agent-rag__query,
.agent-rag__source-title,
.agent-rag__source-excerpt,
.agent-rag__answer {
  overflow-wrap: anywhere;
}

.agent-rag__vector {
  position: relative;
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  gap: 2px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 6px;
}

.agent-rag__vector-cell {
  display: block;
  height: 10px;
  background: var(--varo-agent-border-strong);
  border-radius: 2px;
}

.agent-rag__vector-scan {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 18%;
  pointer-events: none;
  background: color-mix(in srgb, var(--varo-agent-primary) 45%, transparent);
  opacity: 0;
  transform: translateX(-120%);
}

.agent-rag__vector.is-running .agent-rag__vector-scan {
  opacity: 1;
  animation: varo-agent-rag-scan var(--varo-agent-motion-loop) linear infinite;
}

.agent-rag--tone-blue {
  --agent-rag-tone: var(--varo-agent-source-blue);
  --agent-rag-tone-soft: var(--varo-agent-source-blue-soft);
}

.agent-rag--tone-violet {
  --agent-rag-tone: var(--varo-agent-source-violet);
  --agent-rag-tone-soft: var(--varo-agent-source-violet-soft);
}

.agent-rag--tone-rose {
  --agent-rag-tone: var(--varo-agent-source-rose);
  --agent-rag-tone-soft: var(--varo-agent-source-rose-soft);
}

.agent-rag__source {
  position: relative;
  color: inherit;
  appearance: none;
  cursor: pointer;
  transition:
    background-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    border-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    box-shadow var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
  animation: varo-agent-rag-enter var(--varo-agent-motion-enter) var(--varo-agent-motion-ease) both;
}

.agent-rag__source-layout {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.agent-rag__source-number {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font-size: 10px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--agent-rag-tone);
  background: var(--agent-rag-tone-soft);
  border: 1px solid color-mix(in srgb, var(--agent-rag-tone) 30%, transparent);
  border-radius: 8px;
}

.agent-rag__selected-label {
  color: var(--agent-rag-tone);
}

.agent-rag__source.is-highlighted,
.agent-rag__source.is-pinging {
  color: #172033;
  background: var(--agent-rag-tone-soft);
  border-color: var(--agent-rag-tone);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--agent-rag-tone) 18%, transparent);
}

.agent-rag__source-title {
  color: var(--varo-agent-foreground);
}

.agent-rag__source-excerpt {
  color: var(--varo-agent-muted);
}

.agent-rag__source.is-highlighted strong.agent-rag__source-title,
.agent-rag__source.is-pinging strong.agent-rag__source-title {
  color: #172033;
}

.agent-rag__source.is-highlighted .agent-rag__source-excerpt,
.agent-rag__source.is-pinging .agent-rag__source-excerpt {
  color: #475569;
}

.agent-rag__source:focus-visible,
.agent-rag__citation:focus-visible {
  outline: 2px solid var(--agent-rag-tone);
  outline-offset: 2px;
}

.agent-rag__score-track {
  display: block;
  height: 4px;
  overflow: hidden;
  background: var(--varo-agent-fill);
  border-radius: 999px;
}

.agent-rag__score-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--agent-rag-tone);
  border-radius: inherit;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--varo-agent-motion-enter) var(--varo-agent-motion-ease);
  animation: varo-agent-rag-score-enter var(--varo-agent-motion-enter) var(--varo-agent-motion-ease) backwards;
}

.agent-rag__segments {
  gap: 3px;
  min-width: 0;
  padding: 3px;
  overflow: hidden;
  background: var(--varo-agent-fill);
  border: 1px solid var(--varo-agent-border);
  border-radius: 12px;
}

.agent-rag__segment {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 32px;
  color: var(--agent-rag-tone);
  background: var(--agent-rag-tone-soft);
  border: 1px solid color-mix(in srgb, var(--agent-rag-tone) 28%, transparent);
  border-radius: 8px;
  transition:
    border-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    box-shadow var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
  animation: varo-agent-rag-segment-enter var(--varo-agent-motion-enter) var(--varo-agent-motion-ease) both;
}

.agent-rag__segment.is-highlighted,
.agent-rag__segment.is-pinging {
  border-color: var(--agent-rag-tone);
  box-shadow: inset 0 0 0 1px var(--agent-rag-tone);
}

.agent-rag__segment-number {
  overflow: hidden;
  text-overflow: clip;
  font-size: 10px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.agent-rag__answer {
  white-space: pre-wrap;
}

.agent-rag__answer-text {
  animation: varo-agent-rag-text-enter var(--varo-agent-motion-enter) var(--varo-agent-motion-ease) both;
}

.agent-rag__citation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  min-height: 22px;
  padding: 0 5px;
  margin-inline: 2px;
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  line-height: 18px;
  vertical-align: baseline;
  color: var(--agent-rag-tone);
  appearance: none;
  cursor: pointer;
  background: var(--agent-rag-tone-soft);
  border: 1px solid color-mix(in srgb, var(--agent-rag-tone) 30%, transparent);
  border-radius: 6px;
  transition:
    background-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    border-color var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease),
    box-shadow var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease);
}

.agent-rag__citation--missing {
  color: var(--varo-agent-muted);
  cursor: default;
  background: var(--varo-agent-fill);
  border-color: var(--varo-agent-border);
}

.agent-rag__citation.is-highlighted {
  border-color: var(--agent-rag-tone);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--agent-rag-tone) 18%, transparent);
}

.agent-rag__cursor {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 3px;
  vertical-align: -0.16em;
  background: var(--varo-agent-primary);
  border-radius: 999px;
  animation: varo-agent-rag-cursor var(--varo-agent-motion-loop) steps(1) infinite;
}

.agent-rag__ping-ring {
  position: absolute;
  inset: -2px;
  pointer-events: none;
  border: 2px solid var(--agent-rag-tone);
  border-radius: inherit;
  opacity: 0;
}

.is-pinging > .agent-rag__ping-ring {
  animation: varo-agent-rag-ping var(--varo-agent-motion-feedback) var(--varo-agent-motion-ease) 2;
}

@keyframes varo-agent-rag-active {
  0%,
  100% {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--varo-agent-primary) 12%, transparent);
  }

  50% {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--varo-agent-primary) 22%, transparent);
  }
}

@keyframes varo-agent-rag-score-enter {
  from {
    transform: scaleX(0);
  }
}

@keyframes varo-agent-rag-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@keyframes varo-agent-rag-segment-enter {
  from {
    opacity: 0.35;
    transform: scaleX(0.25);
  }
}

@keyframes varo-agent-rag-text-enter {
  from {
    opacity: 0;
  }
}

@keyframes varo-agent-rag-scan {
  from {
    transform: translateX(-120%);
  }

  to {
    transform: translateX(660%);
  }
}

@keyframes varo-agent-rag-cursor {
  0%,
  48% {
    opacity: 1;
  }

  49%,
  100% {
    opacity: 0;
  }
}

@keyframes varo-agent-rag-ping {
  0% {
    opacity: 0.85;
    transform: scale(0.98);
  }

  100% {
    opacity: 0;
    transform: scale(1.04);
  }
}

.agent-rag.is-reduced-motion .agent-rag__connector-fill,
.agent-rag.is-reduced-motion .agent-rag__marker,
.agent-rag.is-reduced-motion .agent-rag__score-fill,
.agent-rag.is-reduced-motion .agent-rag__source,
.agent-rag.is-reduced-motion .agent-rag__action,
.agent-rag.is-reduced-motion .agent-rag__segment,
.agent-rag.is-reduced-motion .agent-rag__answer-text,
.agent-rag.is-reduced-motion .agent-rag__citation,
.agent-rag.is-reduced-motion .agent-rag__ping-ring {
  transition: none;
  animation: none;
}

.agent-rag.is-reduced-motion .agent-rag__vector-scan,
.agent-rag.is-reduced-motion .agent-rag__cursor {
  display: none;
}

.agent-rag.is-reduced-motion .is-pinging > .agent-rag__ping-ring {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .agent-rag__connector-fill,
  .agent-rag__marker,
  .agent-rag__score-fill,
  .agent-rag__source,
  .agent-rag__action,
  .agent-rag__segment,
  .agent-rag__answer-text,
  .agent-rag__citation,
  .agent-rag__ping-ring {
    transition: none;
    animation: none;
  }

  .agent-rag__vector-scan,
  .agent-rag__cursor {
    display: none;
  }

  .is-pinging > .agent-rag__ping-ring {
    opacity: 1;
    transform: none;
  }
}
</style>
