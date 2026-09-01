<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentDiffIndicators, AgentDiffLine, AgentDiffSelection, AgentDiffView, AgentFileDiffLabels } from './file-diff'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
import {

  agentDiffMarker,

  createAgentDiffInlinePairs,
  createAgentDiffSplitRows,
  defaultAgentFileDiffLabels,
  splitAgentDiffContent,
} from './file-diff'

type AgentFileDiffStatus = 'waiting' | 'running' | 'completed' | 'failed'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    additions?: number
    defaultLineNumbers?: boolean
    defaultOpen?: boolean
    defaultView?: AgentDiffView
    defaultWrap?: boolean
    deletions?: number
    disabled?: boolean
    filename: string
    indicators?: AgentDiffIndicators
    inlineChanges?: boolean
    labels?: Partial<AgentFileDiffLabels>
    lineNumbers?: boolean
    lines?: AgentDiffLine[]
    open?: boolean
    showActions?: boolean
    showToolbar?: boolean
    status?: AgentFileDiffStatus
    view?: AgentDiffView
    wrap?: boolean
  }>(),
  {
    defaultLineNumbers: true,
    defaultOpen: true,
    defaultView: 'unified',
    defaultWrap: false,
    disabled: false,
    indicators: 'bars',
    inlineChanges: true,
    labels: () => ({}),
    lineNumbers: undefined,
    lines: () => [],
    open: undefined,
    showActions: true,
    showToolbar: true,
    status: 'completed',
    wrap: undefined,
  },
)

const emit = defineEmits<{
  'accept': []
  'expand': [line: AgentDiffLine, index: number]
  'reject': []
  'select': [selection: AgentDiffSelection]
  'update:lineNumbers': [value: boolean]
  'update:open': [value: boolean]
  'update:view': [value: AgentDiffView]
  'update:wrap': [value: boolean]
}>()

const bodyId = computed(() =>
  `agent-file-diff-${props.filename.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
)
const localLineNumbers = shallowRef(props.defaultLineNumbers)
const localOpen = shallowRef(props.defaultOpen)
const localView = shallowRef<AgentDiffView>(props.defaultView)
const localWrap = shallowRef(props.defaultWrap)
const selectedKey = shallowRef('')
const rootClass = computed(() =>
  cn('agent-file-diff overflow-hidden rounded-[14px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)

const currentLineNumbers = computed(() => props.lineNumbers ?? localLineNumbers.value)
const currentOpen = computed(() => props.open ?? localOpen.value)
const currentView = computed(() => props.view ?? localView.value)
const currentWrap = computed(() => props.wrap ?? localWrap.value)
const resolvedLabels = computed(() => ({ ...defaultAgentFileDiffLabels, ...props.labels }))
const splitRows = computed(() => createAgentDiffSplitRows(props.lines))
const inlinePairs = computed(() => createAgentDiffInlinePairs(splitRows.value))
const inlineSegments = computed(() => props.lines.map((line, index) => {
  const comparison = inlinePairs.value.get(index)
  if (
    !props.inlineChanges
    || comparison === undefined
    || (line.type !== 'add' && line.type !== 'remove')
  ) {
    return [line.content, '', ''] as const
  }
  return splitAgentDiffContent(line.content, comparison)
}))
const counts = computed(() => {
  let additions = 0
  let deletions = 0
  for (const line of props.lines) {
    if (line.type === 'add') { additions += 1 }
    if (line.type === 'remove') { deletions += 1 }
  }
  return {
    additions: props.additions ?? additions,
    deletions: props.deletions ?? deletions,
  }
})
const path = computed(() => {
  const separator = Math.max(props.filename.lastIndexOf('/'), props.filename.lastIndexOf('\\'))
  return separator < 0
    ? { basename: props.filename, directory: '' }
    : {
        basename: props.filename.slice(separator + 1),
        directory: props.filename.slice(0, separator + 1),
      }
})
const collapseAriaLabel = computed(() =>
  currentOpen.value ? resolvedLabels.value.collapse : resolvedLabels.value.expand,
)
const hunkAriaLabels = computed(() =>
  props.lines.map(line => `${resolvedLabels.value.expand}: ${line.collapsedLines ?? 0}`),
)
const unifiedAriaLabels = computed(() =>
  props.lines.map((line, index) =>
    `${resolvedLabels.value.line} ${line.newNumber ?? line.oldNumber ?? index + 1}: ${line.content}`,
  ),
)
const splitAriaLabels = computed(() =>
  splitRows.value.map(row => ({
    addition: row.addition
      ? `${resolvedLabels.value.new} ${resolvedLabels.value.line} ${row.addition.line.newNumber ?? row.addition.index + 1}: ${row.addition.line.content}`
      : '',
    deletion: row.deletion
      ? `${resolvedLabels.value.old} ${resolvedLabels.value.line} ${row.deletion.line.oldNumber ?? row.deletion.index + 1}: ${row.deletion.line.content}`
      : '',
    hunk: row.hunk
      ? `${resolvedLabels.value.expand}: ${row.hunk.line.collapsedLines ?? 0}`
      : '',
  })),
)

function statusLabel(status: AgentFileDiffStatus) {
  if (status === 'completed') { return 'Completed' }
  if (status === 'failed') { return 'Failed' }
  if (status === 'running') { return 'Running' }
  return 'Waiting'
}

function updateOpen(value: boolean) {
  if (props.open === undefined) { localOpen.value = value }
  emit('update:open', value)
}

function updateView(value: AgentDiffView) {
  if (props.view === undefined) { localView.value = value }
  emit('update:view', value)
}

function updateWrap(value: boolean) {
  if (props.wrap === undefined) { localWrap.value = value }
  emit('update:wrap', value)
}

function updateLineNumbers(value: boolean) {
  if (props.lineNumbers === undefined) { localLineNumbers.value = value }
  emit('update:lineNumbers', value)
}

function selectLine(index: number, line: AgentDiffLine, side: AgentDiffSelection['side']) {
  selectedKey.value = `${line.id ?? index}:${side}`
  emit('select', { index, line, side })
}

function expandLine(line: AgentDiffLine, index: number) {
  if (!line.collapsedLines) { return }
  emit('expand', line, index)
}

function statusDotClass(status: AgentFileDiffStatus) {
  return cn(
    'h-[7px] w-[7px] rounded-full',
    status === 'completed' && 'bg-[var(--varo-agent-success)]',
    status === 'running' && 'bg-[var(--varo-agent-primary)]',
    status === 'failed' && 'bg-[var(--varo-agent-danger)]',
    status === 'waiting' && 'bg-[var(--varo-agent-border-strong)]',
  )
}
</script>

<template>
  <view
    :class="rootClass"
    :data-indicators="indicators"
    :data-line-numbers="String(currentLineNumbers)"
    :data-open="String(currentOpen)"
    :data-status="status"
    :data-view="currentView"
    :data-wrap="String(currentWrap)"
  >
    <view class="agent-file-diff__header">
      <view class="agent-file-diff__identity">
        <view class="agent-file-diff__file-icon" aria-hidden="true">
          <text class="agent-file-diff__file-fold" />
        </view>
        <view class="agent-file-diff__path">
          <text v-if="path.directory" class="agent-file-diff__directory">
            {{ path.directory }}
          </text>
          <text class="agent-file-diff__basename">
            {{ path.basename }}
          </text>
        </view>
        <view class="agent-advanced__status inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--varo-agent-text)]" :data-status="status">
          <text :class="statusDotClass(status)" aria-hidden="true" />
          <text>{{ statusLabel(status) }}</text>
        </view>
      </view>
      <view class="agent-file-diff__header-actions">
        <view class="agent-file-diff__counts">
          <text data-kind="addition" :aria-label="`${counts.additions} ${resolvedLabels.additions}`">
            +{{ counts.additions }}
          </text>
          <text data-kind="deletion" :aria-label="`${counts.deletions} ${resolvedLabels.deletions}`">
            −{{ counts.deletions }}
          </text>
        </view>
        <button
          class="agent-file-diff__control agent-file-diff__collapse"
          type="button"
          :aria-controls="bodyId"
          :aria-expanded="currentOpen"
          :aria-label="collapseAriaLabel"
          @click="updateOpen(!currentOpen)"
        >
          <text class="agent-file-diff__collapse-arrow" aria-hidden="true" />
        </button>
      </view>
    </view>

    <view v-if="currentOpen" :id="bodyId" class="agent-file-diff__body" role="region" :aria-label="filename">
      <view v-if="showToolbar" class="agent-file-diff__toolbar" :aria-label="resolvedLabels.display">
        <view class="agent-file-diff__segmented" role="group">
          <button
            class="agent-file-diff__control"
            type="button"
            :aria-pressed="currentView === 'unified'"
            :data-active="String(currentView === 'unified')"
            @click="updateView('unified')"
          >
            {{ resolvedLabels.unified }}
          </button>
          <button
            class="agent-file-diff__control"
            type="button"
            :aria-pressed="currentView === 'split'"
            :data-active="String(currentView === 'split')"
            @click="updateView('split')"
          >
            {{ resolvedLabels.split }}
          </button>
        </view>
        <view class="agent-file-diff__settings">
          <button
            class="agent-file-diff__control"
            type="button"
            :aria-pressed="currentWrap"
            :data-active="String(currentWrap)"
            @click="updateWrap(!currentWrap)"
          >
            {{ resolvedLabels.wrap }}
          </button>
          <button
            class="agent-file-diff__control"
            type="button"
            :aria-pressed="currentLineNumbers"
            :data-active="String(currentLineNumbers)"
            @click="updateLineNumbers(!currentLineNumbers)"
          >
            {{ resolvedLabels.lineNumbers }}
          </button>
        </view>
      </view>

      <scroll-view class="agent-file-diff__viewport" scroll-x :show-scrollbar="false">
        <view v-if="!lines.length" class="agent-file-diff__empty">
          {{ resolvedLabels.empty }}
        </view>

        <view v-else-if="currentView === 'unified'" class="agent-file-diff__unified">
          <template v-for="(line, index) in lines" :key="line.id ?? index">
            <button
              v-if="line.type === 'hunk'"
              class="agent-file-diff__hunk"
              type="button"
              :disabled="!line.collapsedLines"
              :aria-label="hunkAriaLabels[index]"
              @click="expandLine(line, index)"
            >
              <text class="agent-file-diff__hunk-icon" aria-hidden="true" />
              <text class="agent-file-diff__hunk-label">
                {{ line.content }}
              </text>
              <text v-if="line.collapsedLines" class="agent-file-diff__hunk-count">
                {{ line.collapsedLines }} {{ resolvedLabels.unchanged }}
              </text>
            </button>
            <button
              v-else
              class="agent-file-diff__line"
              type="button"
              :aria-label="unifiedAriaLabels[index]"
              :data-selected="String(selectedKey === `${line.id ?? index}:unified`)"
              :data-type="line.type"
              @click="selectLine(index, line, 'unified')"
            >
              <text v-if="currentLineNumbers" class="agent-file-diff__number" data-side="old" aria-hidden="true">
                {{ line.oldNumber ?? '' }}
              </text>
              <text v-if="currentLineNumbers" class="agent-file-diff__number" data-side="new" aria-hidden="true">
                {{ line.newNumber ?? '' }}
              </text>
              <text class="agent-file-diff__marker" aria-hidden="true">
                {{ agentDiffMarker(line.type) }}
              </text>
              <slot name="line" :index="index" :line="line" side="unified">
                <text class="agent-file-diff__code">
                  <text>{{ inlineSegments[index][0] }}</text>
                  <text v-if="inlineSegments[index][1]" class="agent-file-diff__inline-change">
                    {{ inlineSegments[index][1] }}
                  </text>
                  <text>{{ inlineSegments[index][2] }}</text>
                </text>
              </slot>
            </button>
          </template>
        </view>

        <view v-else class="agent-file-diff__split">
          <template v-for="(row, rowIndex) in splitRows" :key="row.hunk?.line.id ?? `row:${rowIndex}`">
            <button
              v-if="row.hunk"
              class="agent-file-diff__hunk"
              type="button"
              :disabled="!row.hunk.line.collapsedLines"
              :aria-label="splitAriaLabels[rowIndex].hunk"
              @click="expandLine(row.hunk.line, row.hunk.index)"
            >
              <text class="agent-file-diff__hunk-icon" aria-hidden="true" />
              <text class="agent-file-diff__hunk-label">
                {{ row.hunk.line.content }}
              </text>
              <text v-if="row.hunk.line.collapsedLines" class="agent-file-diff__hunk-count">
                {{ row.hunk.line.collapsedLines }} {{ resolvedLabels.unchanged }}
              </text>
            </button>
            <view v-else class="agent-file-diff__split-row">
              <button
                v-if="row.deletion"
                class="agent-file-diff__side"
                type="button"
                :aria-label="splitAriaLabels[rowIndex].deletion"
                :data-selected="String(selectedKey === `${row.deletion.line.id ?? row.deletion.index}:old`)"
                :data-type="row.deletion.line.type"
                @click="selectLine(row.deletion.index, row.deletion.line, 'old')"
              >
                <text v-if="currentLineNumbers" class="agent-file-diff__number" data-side="old" aria-hidden="true">
                  {{ row.deletion.line.oldNumber ?? '' }}
                </text>
                <text class="agent-file-diff__marker" aria-hidden="true">
                  {{ agentDiffMarker(row.deletion.line.type) }}
                </text>
                <slot name="line" :index="row.deletion.index" :line="row.deletion.line" side="old">
                  <text class="agent-file-diff__code">
                    <text>{{ inlineSegments[row.deletion.index][0] }}</text>
                    <text v-if="inlineSegments[row.deletion.index][1]" class="agent-file-diff__inline-change">
                      {{ inlineSegments[row.deletion.index][1] }}
                    </text>
                    <text>{{ inlineSegments[row.deletion.index][2] }}</text>
                  </text>
                </slot>
              </button>
              <view v-else class="agent-file-diff__side agent-file-diff__side--empty" aria-hidden="true" />

              <button
                v-if="row.addition"
                class="agent-file-diff__side"
                type="button"
                :aria-label="splitAriaLabels[rowIndex].addition"
                :data-selected="String(selectedKey === `${row.addition.line.id ?? row.addition.index}:new`)"
                :data-type="row.addition.line.type"
                @click="selectLine(row.addition.index, row.addition.line, 'new')"
              >
                <text v-if="currentLineNumbers" class="agent-file-diff__number" data-side="new" aria-hidden="true">
                  {{ row.addition.line.newNumber ?? '' }}
                </text>
                <text class="agent-file-diff__marker" aria-hidden="true">
                  {{ agentDiffMarker(row.addition.line.type) }}
                </text>
                <slot name="line" :index="row.addition.index" :line="row.addition.line" side="new">
                  <text class="agent-file-diff__code">
                    <text>{{ inlineSegments[row.addition.index][0] }}</text>
                    <text v-if="inlineSegments[row.addition.index][1]" class="agent-file-diff__inline-change">
                      {{ inlineSegments[row.addition.index][1] }}
                    </text>
                    <text>{{ inlineSegments[row.addition.index][2] }}</text>
                  </text>
                </slot>
              </button>
              <view v-else class="agent-file-diff__side agent-file-diff__side--empty" aria-hidden="true" />
            </view>
          </template>
        </view>
      </scroll-view>
    </view>

    <view v-if="currentOpen && showActions" class="agent-file-diff__footer">
      <text>
        <text class="agent-file-diff__changed-count">
          {{ counts.additions + counts.deletions }}
        </text> {{ resolvedLabels.changed }}
      </text>
      <view>
        <button class="agent-file-diff__action" type="button" :disabled="disabled" @click="emit('reject')">
          {{ resolvedLabels.reject }}
        </button>
        <button class="agent-file-diff__action" type="button" :disabled="disabled" @click="emit('accept')">
          {{ resolvedLabels.accept }}
        </button>
      </view>
    </view>
  </view>
</template>

<style src="./agent-file-diff.css"></style>

<style scoped>
.agent-file-diff__directory {
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  color: var(--agent-diff-muted);
  white-space: nowrap;
}

.agent-file-diff__basename {
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 780;
  color: var(--agent-diff-text);
  white-space: nowrap;
}

.agent-file-diff__changed-count {
  font-weight: 700;
  color: var(--agent-diff-text);
}

.agent-file-diff__split {
  display: block;
  width: 760px;
  min-width: 760px;
}

.agent-file-diff__split-row {
  display: grid;
  grid-template-columns: 380px 380px;
}

.agent-file-diff[data-wrap='true'] .agent-file-diff__split {
  width: 640px;
  min-width: 640px;
}

.agent-file-diff[data-wrap='true'] .agent-file-diff__split-row {
  grid-template-columns: 320px 320px;
}

.agent-file-diff__hunk:disabled {
  opacity: 1;
}

@media (max-width: 600px) {
  .agent-file-diff__directory {
    display: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
