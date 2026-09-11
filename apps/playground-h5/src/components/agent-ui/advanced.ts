import type { PropType, VNodeChild } from 'vue'
import type { ClassValue } from '../../lib/cn'
import type {
  AgentActivityItem,
  AgentAdvancedStatus,
  AgentCitationItem,
  AgentContextChunk,
  AgentFineTuneControl,
  AgentFlowNode,
  AgentInsightItem,
  AgentRadioChoice,
  AgentSearchItem,
  AgentSelectionAction,
  AgentSidebarGroup,
  AgentSidebarItem,
} from './advanced-types'
import type { AgentFilterOption, AgentTableColumn, AgentTableRow } from './agent-table'
import type { AgentDiffIndicators, AgentDiffLine, AgentDiffSelection, AgentDiffView, AgentFileDiffLabels, IndexedAgentDiffLine } from './file-diff'
import { computed, defineComponent, h, shallowRef, useId } from 'vue'
import { cn } from '../../lib/cn'
import {

  agentTableCellValue as cellValue,
} from './agent-table'
import {

  agentDiffMarker,

  createAgentDiffInlinePairs,
  createAgentDiffSplitRows,
  defaultAgentFileDiffLabels,

  splitAgentDiffContent,
} from './file-diff'
import './agent-advanced.css'

export type {
  AgentActivityItem,
  AgentAdvancedStatus,
  AgentCitationItem,
  AgentCodeLine,
  AgentContextChunk,
  AgentFineTuneControl,
  AgentFlowNode,
  AgentInsightItem,
  AgentRadioChoice,
  AgentSearchItem,
  AgentSelectionAction,
  AgentSidebarGroup,
  AgentSidebarItem,
} from './advanced-types'
export type { AgentFilterOption, AgentTableColumn, AgentTableRow } from './agent-table'
export type {
  AgentDiffIndicators,
  AgentDiffLine,
  AgentDiffSelection,
  AgentDiffView,
  AgentFileDiffLabels,
} from './file-diff'

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | HTMLSelectElement | null
  return miniEvent.detail?.value ?? target?.value ?? ''
}

function statusLabel(status: AgentAdvancedStatus) {
  if (status === 'completed') { return 'Completed' }
  if (status === 'failed') { return 'Failed' }
  if (status === 'running') { return 'Running' }
  return 'Waiting'
}

function renderStatus(status: AgentAdvancedStatus) {
  return h('span', { 'class': 'agent-advanced__status', 'data-status': status }, [
    h('i', { 'class': 'agent-advanced__status-dot', 'aria-hidden': 'true' }),
    statusLabel(status),
  ])
}

function activityKindLabel(kind: AgentActivityItem['kind']) {
  if (kind === 'reasoning') { return '推理' }
  if (kind === 'search') { return '检索' }
  if (kind === 'tool') { return '工具' }
  return '轨迹'
}

function renderActivityKindIcon(kind: AgentActivityItem['kind']) {
  const children = kind === 'search'
    ? [h('circle', { cx: '11', cy: '11', r: '6' }), h('path', { d: 'm16 16 4 4' })]
    : [h('path', {
        d: kind === 'reasoning'
          ? 'M12 3.5 13.4 8 18 9.2 13.4 10.5 12 15l-1.4-4.5L6 9.2 10.6 8 12 3.5zM18 13.5l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z'
          : kind === 'tool'
            ? 'M8 7h8M8 12h8M8 17h5'
            : 'M7 7h10M7 12h10M7 17h6',
      })]
  return h('svg', {
    'aria-hidden': 'true',
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 1.8,
    'viewBox': '0 0 24 24',
  }, children)
}

function citationMark(item: AgentCitationItem) {
  const source = item.domain || item.title
  return source.trim().charAt(0).toUpperCase() || '#'
}

function renderPlusIcon() {
  return h('svg', {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-width': 2,
    'viewBox': '0 0 24 24',
    'width': 15,
    'height': 15,
    'aria-hidden': 'true',
  }, [h('path', { d: 'M12 5v14M5 12h14' })])
}
function renderChatIcon() {
  return h('svg', {
    'aria-hidden': 'true',
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 1.8,
    'viewBox': '0 0 24 24',
  }, [h('path', { d: 'M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' })])
}

function renderSearchIcon() {
  return h('svg', {
    'aria-hidden': 'true',
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 1.8,
    'viewBox': '0 0 24 24',
  }, [h('circle', { cx: '11', cy: '11', r: '6' }), h('path', { d: 'm16 16 4 4' })])
}

export const AgentRadioGroup = defineComponent({
  name: 'AgentRadioGroup',
  props: {
    choices: { type: Array as PropType<AgentRadioChoice[]>, default: () => [] },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
    value: { type: String, default: '' },
  },
  emits: { 'change': (_value: string) => true, 'update:value': (_value: string) => true },
  setup(props, { emit }) {
    return () => h('div', {
      'class': 'agent-radio-group',
      'data-orientation': props.orientation,
      'role': 'radiogroup',
    }, props.choices.map(choice => h('button', {
      'aria-checked': String(choice.value === props.value),
      'class': 'agent-radio-group__item',
      'data-active': String(choice.value === props.value),
      'disabled': choice.disabled,
      'key': choice.value,
      'role': 'radio',
      'type': 'button',
      'onClick': () => {
        if (choice.disabled) { return }
        emit('update:value', choice.value)
        emit('change', choice.value)
      },
    }, [
      h('i', { 'aria-hidden': 'true' }),
      h('span', [h('strong', choice.label), choice.description ? h('small', choice.description) : null]),
    ])))
  },
})
export const AgentMessageScroller = defineComponent({
  name: 'AgentMessageScroller',
  props: {
    atLiveEdge: { type: Boolean, default: true },
    followLabel: { type: String, default: 'Jump to latest' },
    maxHeight: { type: [Number, String], default: 480 },
  },
  emits: { 'follow': () => true, 'update:atLiveEdge': (_value: boolean) => true },
  setup(props, { emit, slots }) {
    return () => h('section', {
      'class': 'agent-message-scroller',
      'data-live-edge': String(props.atLiveEdge),
      'style': { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight },
    }, [
      h('div', { 'class': 'agent-message-scroller__viewport', 'role': 'log', 'aria-live': 'polite' }, slots.default?.()),
      !props.atLiveEdge
        ? h('button', {
            class: 'agent-message-scroller__follow',
            type: 'button',
            onClick: () => {
              emit('update:atLiveEdge', true)
              emit('follow')
            },
          }, props.followLabel)
        : null,
    ])
  },
})

export const AgentCodeBlock = defineComponent({
  name: 'AgentCodeBlock',
  props: {
    code: { type: String, default: '' },
    filename: { type: String, default: 'untitled.ts' },
    focusedLines: { type: Array as PropType<number[]>, default: () => [] },
    language: { type: String, default: 'text' },
    lineNumbers: { type: Boolean, default: true },
    status: { type: String as PropType<'complete' | 'streaming'>, default: 'complete' },
  },
  emits: { copy: (_code: string) => true },
  setup(props, { emit, slots }) {
    const lines = computed(() => props.code.split('\n'))
    return () => h('figure', { 'class': 'agent-code-block', 'data-status': props.status }, [
      h('figcaption', { class: 'agent-code-block__header' }, [
        h('span', [h('strong', props.filename), h('small', props.language)]),
        h('button', { type: 'button', onClick: () => emit('copy', props.code) }, 'Copy'),
      ]),
      h('pre', { class: 'agent-code-block__body' }, lines.value.map((line, index) =>
        h('code', {
          'class': 'agent-code-block__line',
          'data-focused': String(props.focusedLines.includes(index + 1)),
          'key': index,
        }, [
          props.lineNumbers ? h('span', { 'aria-hidden': 'true' }, String(index + 1)) : null,
          h('b', line || ' '),
        ]),
      )),
      props.status === 'streaming' ? h('i', { 'class': 'agent-code-block__cursor', 'aria-hidden': 'true' }) : null,
      slots.footer?.(),
    ])
  },
})

export const AgentFileDiff = defineComponent({
  name: 'AgentFileDiff',
  props: {
    className: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
    additions: { type: Number as PropType<number | undefined>, default: undefined },
    defaultLineNumbers: { type: Boolean, default: true },
    defaultOpen: { type: Boolean, default: true },
    defaultView: { type: String as PropType<AgentDiffView>, default: 'unified' },
    defaultWrap: { type: Boolean, default: false },
    deletions: { type: Number as PropType<number | undefined>, default: undefined },
    disabled: { type: Boolean, default: false },
    filename: { type: String, required: true },
    indicators: { type: String as PropType<AgentDiffIndicators>, default: 'bars' },
    inlineChanges: { type: Boolean, default: true },
    labels: { type: Object as PropType<Partial<AgentFileDiffLabels>>, default: () => ({}) },
    lineNumbers: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    lines: { type: Array as PropType<AgentDiffLine[]>, default: () => [] },
    open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    showActions: { type: Boolean, default: true },
    showToolbar: { type: Boolean, default: true },
    status: { type: String as PropType<AgentAdvancedStatus>, default: 'completed' },
    view: { type: String as PropType<AgentDiffView | undefined>, default: undefined },
    wrap: { type: Boolean as PropType<boolean | undefined>, default: undefined },
  },
  emits: {
    'accept': () => true,
    'expand': (_line: AgentDiffLine, _index: number) => true,
    'reject': () => true,
    'select': (_selection: AgentDiffSelection) => true,
    'update:lineNumbers': (_value: boolean) => true,
    'update:open': (_value: boolean) => true,
    'update:view': (_value: AgentDiffView) => true,
    'update:wrap': (_value: boolean) => true,
  },
  setup(props, { emit, slots }) {
    const bodyId = `agent-file-diff-${useId()}`
    const localLineNumbers = shallowRef(props.defaultLineNumbers)
    const localOpen = shallowRef(props.defaultOpen)
    const localView = shallowRef<AgentDiffView>(props.defaultView)
    const localWrap = shallowRef(props.defaultWrap)
    const selectedKey = shallowRef('')

    const currentLineNumbers = computed(() => props.lineNumbers ?? localLineNumbers.value)
    const currentOpen = computed(() => props.open ?? localOpen.value)
    const currentView = computed(() => props.view ?? localView.value)
    const currentWrap = computed(() => props.wrap ?? localWrap.value)
    const labels = computed(() => ({ ...defaultAgentFileDiffLabels, ...props.labels }))
    const splitRows = computed(() => createAgentDiffSplitRows(props.lines))
    const inlinePairs = computed(() => createAgentDiffInlinePairs(splitRows.value))
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

    function selectLine(entry: IndexedAgentDiffLine, side: AgentDiffSelection['side']) {
      selectedKey.value = `${entry.line.id ?? entry.index}:${side}`
      emit('select', { index: entry.index, line: entry.line, side })
    }

    function renderLineContent(entry: IndexedAgentDiffLine, side: AgentDiffSelection['side']) {
      const slotted = slots.line?.({ index: entry.index, line: entry.line, side })
      if (slotted?.length) { return h('code', { class: 'agent-file-diff__code' }, slotted) }

      const comparison = inlinePairs.value.get(entry.index)
      if (
        !props.inlineChanges
        || comparison === undefined
        || (entry.line.type !== 'add' && entry.line.type !== 'remove')
      ) {
        return h('code', { class: 'agent-file-diff__code' }, entry.line.content || ' ')
      }

      const [before, changed, after] = splitAgentDiffContent(entry.line.content, comparison)
      return h('code', { class: 'agent-file-diff__code' }, [
        before,
        changed ? h('mark', { class: 'agent-file-diff__inline-change' }, changed) : null,
        after,
      ])
    }

    function renderHunk(entry: IndexedAgentDiffLine) {
      const interactive = (entry.line.collapsedLines ?? 0) > 0
      return h(interactive ? 'button' : 'div', {
        'class': 'agent-file-diff__hunk',
        'type': interactive ? 'button' : undefined,
        'aria-label': interactive ? `${labels.value.expand}: ${entry.line.collapsedLines}` : undefined,
        'onClick': interactive ? () => emit('expand', entry.line, entry.index) : undefined,
      }, [
        h('span', { 'class': 'agent-file-diff__hunk-icon', 'aria-hidden': 'true' }),
        h('span', { class: 'agent-file-diff__hunk-label' }, entry.line.content),
        entry.line.collapsedLines
          ? h('span', { class: 'agent-file-diff__hunk-count' }, `${entry.line.collapsedLines} ${labels.value.unchanged}`)
          : null,
      ])
    }

    function renderUnifiedLine(line: AgentDiffLine, index: number) {
      const entry = { index, line }
      if (line.type === 'hunk') { return renderHunk(entry) }
      const key = `${line.id ?? index}:unified`
      return h('button', {
        'class': 'agent-file-diff__line',
        'type': 'button',
        key,
        'aria-label': `${labels.value.line} ${line.newNumber ?? line.oldNumber ?? index + 1}: ${line.content}`,
        'data-selected': String(selectedKey.value === key),
        'data-type': line.type,
        'onClick': () => selectLine(entry, 'unified'),
      }, [
        currentLineNumbers.value ? h('span', { 'class': 'agent-file-diff__number', 'data-side': 'old', 'aria-hidden': 'true' }, String(line.oldNumber ?? '')) : null,
        currentLineNumbers.value ? h('span', { 'class': 'agent-file-diff__number', 'data-side': 'new', 'aria-hidden': 'true' }, String(line.newNumber ?? '')) : null,
        h('span', { 'class': 'agent-file-diff__marker', 'aria-hidden': 'true' }, agentDiffMarker(line.type)),
        renderLineContent(entry, 'unified'),
      ])
    }

    function renderSplitSide(entry: IndexedAgentDiffLine | undefined, side: 'new' | 'old') {
      if (entry === undefined) { return h('div', { 'class': 'agent-file-diff__side agent-file-diff__side--empty', 'aria-hidden': 'true' }) }
      const key = `${entry.line.id ?? entry.index}:${side}`
      const lineNumber = side === 'old' ? entry.line.oldNumber : entry.line.newNumber
      return h('button', {
        'class': 'agent-file-diff__side',
        'type': 'button',
        key,
        'aria-label': `${side === 'old' ? labels.value.old : labels.value.new} ${labels.value.line} ${lineNumber ?? entry.index + 1}: ${entry.line.content}`,
        'data-selected': String(selectedKey.value === key),
        'data-type': entry.line.type,
        'onClick': () => selectLine(entry, side),
      }, [
        currentLineNumbers.value
          ? h('span', { 'class': 'agent-file-diff__number', 'data-side': side, 'aria-hidden': 'true' }, String(lineNumber ?? ''))
          : null,
        h('span', { 'class': 'agent-file-diff__marker', 'aria-hidden': 'true' }, agentDiffMarker(entry.line.type)),
        renderLineContent(entry, side),
      ])
    }

    function renderToolbar() {
      return h('nav', { 'class': 'agent-file-diff__toolbar', 'aria-label': labels.value.display }, [
        h('div', { class: 'agent-file-diff__segmented', role: 'group' }, [
          h('button', {
            'class': 'agent-file-diff__control',
            'type': 'button',
            'aria-pressed': String(currentView.value === 'unified'),
            'data-active': String(currentView.value === 'unified'),
            'onClick': () => updateView('unified'),
          }, labels.value.unified),
          h('button', {
            'class': 'agent-file-diff__control',
            'type': 'button',
            'aria-pressed': String(currentView.value === 'split'),
            'data-active': String(currentView.value === 'split'),
            'onClick': () => updateView('split'),
          }, labels.value.split),
        ]),
        h('div', { class: 'agent-file-diff__settings' }, [
          h('button', {
            'class': 'agent-file-diff__control',
            'type': 'button',
            'aria-pressed': String(currentWrap.value),
            'data-active': String(currentWrap.value),
            'onClick': () => updateWrap(!currentWrap.value),
          }, labels.value.wrap),
          h('button', {
            'class': 'agent-file-diff__control',
            'type': 'button',
            'aria-pressed': String(currentLineNumbers.value),
            'data-active': String(currentLineNumbers.value),
            'onClick': () => updateLineNumbers(!currentLineNumbers.value),
          }, labels.value.lineNumbers),
        ]),
      ])
    }

    return () => h('section', {
      'class': cn('agent-file-diff overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm', props.className),
      'data-indicators': props.indicators,
      'data-line-numbers': String(currentLineNumbers.value),
      'data-open': String(currentOpen.value),
      'data-status': props.status,
      'data-view': currentView.value,
      'data-wrap': String(currentWrap.value),
    }, [
      h('header', { class: 'agent-file-diff__header' }, [
        h('div', { class: 'agent-file-diff__identity' }, [
          h('span', { 'class': 'agent-file-diff__file-icon', 'aria-hidden': 'true' }, h('i', { class: 'agent-file-diff__file-fold' })),
          h('span', { class: 'agent-file-diff__path' }, [
            path.value.directory ? h('small', path.value.directory) : null,
            h('strong', path.value.basename),
          ]),
          renderStatus(props.status),
        ]),
        h('div', { class: 'agent-file-diff__header-actions' }, [
          h('span', { class: 'agent-file-diff__counts' }, [
            h('span', { 'data-kind': 'addition', 'aria-label': `${counts.value.additions} ${labels.value.additions}` }, `+${counts.value.additions}`),
            h('span', { 'data-kind': 'deletion', 'aria-label': `${counts.value.deletions} ${labels.value.deletions}` }, `−${counts.value.deletions}`),
          ]),
          h('button', {
            'class': 'agent-file-diff__control agent-file-diff__collapse',
            'type': 'button',
            'aria-controls': bodyId,
            'aria-expanded': String(currentOpen.value),
            'aria-label': currentOpen.value ? labels.value.collapse : labels.value.expand,
            'onClick': () => updateOpen(!currentOpen.value),
          }, h('span', { 'class': 'agent-file-diff__collapse-arrow', 'aria-hidden': 'true' })),
        ]),
      ]),
      currentOpen.value
        ? h('div', { 'class': 'agent-file-diff__body', 'id': bodyId, 'role': 'region', 'aria-label': props.filename }, [
            props.showToolbar ? renderToolbar() : null,
            h('div', { class: 'agent-file-diff__viewport' }, [
              props.lines.length === 0
                ? h('div', { class: 'agent-file-diff__empty' }, labels.value.empty)
                : currentView.value === 'unified'
                  ? h('div', { class: 'agent-file-diff__unified' }, props.lines.map(renderUnifiedLine))
                  : h('div', { class: 'agent-file-diff__split' }, splitRows.value.map((row, index) =>
                      row.hunk
                        ? renderHunk(row.hunk)
                        : h('div', { class: 'agent-file-diff__split-row', key: `row:${index}` }, [
                            renderSplitSide(row.deletion, 'old'),
                            renderSplitSide(row.addition, 'new'),
                          ]),
                    )),
            ]),
          ])
        : null,
      currentOpen.value && props.showActions
        ? h('footer', { class: 'agent-file-diff__footer' }, [
            h('span', [
              h('strong', String(counts.value.additions + counts.value.deletions)),
              ` ${labels.value.changed}`,
            ]),
            h('div', [
              h('button', {
                class: 'agent-file-diff__action',
                type: 'button',
                disabled: props.disabled,
                onClick: () => emit('reject'),
              }, labels.value.reject),
              h('button', {
                class: 'agent-file-diff__action',
                type: 'button',
                disabled: props.disabled,
                onClick: () => emit('accept'),
              }, labels.value.accept),
            ]),
          ])
        : null,
    ])
  },
})

export const AgentToolResult = defineComponent({
  name: 'AgentToolResult',
  props: {
    defaultOpen: Boolean,
    duration: String,
    name: { type: String, required: true },
    output: { type: String, default: '' },
    status: { type: String as PropType<AgentAdvancedStatus>, default: 'completed' },
    summary: String,
  },
  emits: { 'retry': () => true, 'update:open': (_value: boolean) => true },
  setup(props, { emit, slots }) {
    const open = shallowRef(props.defaultOpen || props.status === 'running' || props.status === 'failed')
    const meta = computed(() => [props.duration, props.summary].filter(Boolean).join(' · '))
    return () => h('section', { 'class': 'agent-tool-result', 'data-open': String(open.value), 'data-status': props.status }, [
      h('button', {
        'class': 'agent-tool-result__header',
        'type': 'button',
        'aria-expanded': String(open.value),
        'onClick': () => {
          open.value = !open.value
          emit('update:open', open.value)
        },
      }, [
        h('span', { class: 'agent-tool-result__command' }, [
          h('span', { 'class': 'agent-tool-result__prompt', 'aria-hidden': 'true' }, '$'),
          h('strong', props.name),
        ]),
        h('span', { class: 'agent-tool-result__meta' }, [
          renderStatus(props.status),
          meta.value ? h('small', meta.value) : null,
        ]),
      ]),
      open.value
        ? h('div', { class: 'agent-tool-result__body' }, slots.default?.() ?? [h('pre', props.output)])
        : null,
      props.status === 'failed' && open.value
        ? h('button', { class: 'agent-tool-result__retry', type: 'button', onClick: () => emit('retry') }, 'Retry')
        : null,
    ])
  },
})

export const AgentImageGeneration = defineComponent({
  name: 'AgentImageGeneration',
  props: {
    className: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
    alt: { type: String, default: 'Generated image' },
    progress: { type: Number, default: 0 },
    prompt: String,
    src: String,
    status: { type: String as PropType<'completed' | 'failed' | 'generating' | 'queued'>, default: 'queued' },
  },
  emits: { download: (_src: string) => true, retry: () => true },
  setup(props, { emit }) {
    const progress = computed(() => Math.min(100, Math.max(0, props.progress)))
    const statusCopy = computed(() => {
      if (props.status === 'queued') {
        return {
          detail: 'Waiting for a generation slot',
          label: 'Queued',
        }
      }
      if (props.status === 'failed') {
        return {
          detail: 'The image could not be generated',
          label: 'Generation failed',
        }
      }
      if (props.status === 'completed') {
        return {
          detail: 'Ready to review',
          label: 'Image complete',
        }
      }
      return {
        detail: `${progress.value}% · Rendering details`,
        label: 'Refining image',
      }
    })
    const hasAction = computed(() =>
      props.status === 'failed' || (props.status === 'completed' && Boolean(props.src)),
    )

    return () => h('figure', {
      'class': cn('agent-image-generation overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className),
      'data-status': props.status,
    }, [
      h('div', { class: 'agent-image-generation__canvas relative grid min-h-[252px] place-items-center overflow-hidden' }, [
        props.src
          ? h('img', { class: 'block min-h-[252px] h-full w-full object-cover', alt: props.alt, src: props.src })
          : h('div', { class: 'agent-image-generation__placeholder relative z-10 grid place-items-center gap-3 text-center' }, [
              h('div', { 'class': 'agent-image-generation__preview relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-[20px] border border-teal-700/20 bg-white/80 text-teal-700 shadow-[0_18px_34px_rgba(15,118,110,.13)]', 'aria-hidden': 'true' }, [
                h('span', { class: 'agent-image-generation__glow absolute h-[46px] w-[46px] rounded-2xl bg-teal-300/15 blur-lg' }),
                h('svg', {
                  'class': 'relative z-[2] h-[34px] w-[34px]',
                  'viewBox': '0 0 24 24',
                  'fill': 'none',
                  'stroke': 'currentColor',
                  'stroke-width': '1.7',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                }, [
                  h('rect', { x: '3', y: '4', width: '16', height: '15', rx: '3' }),
                  h('circle', { cx: '8', cy: '9', r: '1.5' }),
                  h('path', { d: 'm5.5 16 3.8-3.8 2.8 2.8 2.2-2.2 2.7 3.2' }),
                  h('path', { d: 'M19 2v4M17 4h4' }),
                ]),
                props.status === 'generating'
                  ? h('span', { class: 'agent-image-generation__scan' })
                  : null,
              ]),
              h('span', { class: 'agent-image-generation__state grid gap-[3px]' }, [
                h('strong', { class: 'text-[13px] font-bold leading-[18px]' }, statusCopy.value.label),
                h('small', { class: 'text-[10.5px] leading-[15px]' }, statusCopy.value.detail),
              ]),
            ]),
        props.status === 'generating'
          ? h('div', { class: 'agent-image-generation__progress absolute inset-x-3.5 bottom-[13px] z-[2] grid gap-1.5' }, [
              h('span', { class: 'agent-image-generation__progress-meta flex items-center justify-between text-[9px]' }, [
                h('small', { class: 'font-semibold tracking-[.03em]' }, 'Generation progress'),
                h('strong', { class: 'text-[10px] tabular-nums text-teal-700' }, `${progress.value}%`),
              ]),
              h('span', { class: 'agent-image-generation__track block h-[5px] overflow-hidden rounded-full bg-white/80' }, [
                h('i', { class: 'block h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-300', style: { width: `${progress.value}%` } }),
              ]),
            ])
          : null,
      ]),
      props.prompt
        ? h('figcaption', { class: 'grid gap-[3px] border-t border-slate-200 px-3.5 py-3' }, [
            h('small', { class: 'text-[8.5px] font-bold uppercase leading-3 tracking-[.12em] text-slate-400' }, 'Prompt'),
            h('span', { class: 'text-[11px] leading-4 text-slate-700' }, props.prompt),
          ])
        : null,
      hasAction.value
        ? h('footer', [
            props.status === 'failed'
              ? h('button', { type: 'button', onClick: () => emit('retry') }, 'Retry')
              : null,
            props.status === 'completed' && props.src
              ? h('button', { type: 'button', onClick: () => emit('download', props.src ?? '') }, 'Download')
              : null,
          ])
        : null,
    ])
  },
})

export const AgentToolApproval = defineComponent({
  name: 'AgentToolApproval',
  props: {
    description: String,
    details: { type: Array as PropType<Array<{ label: string, value: string }>>, default: () => [] },
    remember: Boolean,
    tool: { type: String, required: true },
  },
  emits: {
    'allow': (_options: { remember: boolean }) => true,
    'deny': () => true,
    'update:remember': (_value: boolean) => true,
  },
  setup(props, { emit }) {
    return () => h('section', { 'class': 'agent-tool-approval', 'role': 'group', 'aria-label': `Approve ${props.tool}` }, [
      h('header', [h('span', '!'), h('div', [h('small', 'Tool permission'), h('strong', props.tool), props.description ? h('p', props.description) : null])]),
      props.details.length
        ? h('dl', props.details.flatMap(detail => [h('dt', detail.label), h('dd', detail.value)]))
        : null,
      h('label', [
        h('input', {
          checked: props.remember,
          type: 'checkbox',
          onChange: () => emit('update:remember', !props.remember),
        }),
        'Remember this permission',
      ]),
      h('footer', [
        h('button', { type: 'button', onClick: () => emit('deny') }, 'Deny'),
        h('button', { type: 'button', onClick: () => emit('allow', { remember: props.remember }) }, 'Allow once'),
      ]),
    ])
  },
})

export const AgentCitations = defineComponent({
  name: 'AgentCitations',
  props: {
    defaultOpen: Boolean,
    items: { type: Array as PropType<AgentCitationItem[]>, default: () => [] },
    title: { type: String, default: 'Sources' },
  },
  emits: { 'open': (_item: AgentCitationItem) => true, 'update:open': (_value: boolean) => true },
  setup(props, { emit }) {
    const open = shallowRef(props.defaultOpen)
    return () => h('section', { 'class': 'agent-citations', 'data-open': String(open.value) }, [
      h('button', {
        'class': 'agent-citations__trigger',
        'type': 'button',
        'aria-expanded': String(open.value),
        'onClick': () => {
          open.value = !open.value
          emit('update:open', open.value)
        },
      }, [
        h('span', { class: 'agent-citations__heading' }, [
          h('strong', props.title),
          h('small', open.value ? '点击来源打开原文' : '展开查看引用来源'),
        ]),
        h('span', { class: 'agent-citations__count' }, `${props.items.length}`),
      ]),
      open.value
        ? h('ol', { class: 'agent-citations__list' }, props.items.map(item => h('li', { key: item.id }, [
            h('button', { class: 'agent-citations__item', type: 'button', onClick: () => emit('open', item) }, [
              h('span', { 'class': 'agent-citations__mark', 'aria-hidden': 'true' }, citationMark(item)),
              h('span', { class: 'agent-citations__copy' }, [
                h('strong', item.title),
                h('small', item.domain || item.url || ''),
                item.description ? h('p', item.description) : null,
              ]),
            ]),
          ])))
        : null,
    ])
  },
})

export const AgentActivity = defineComponent({
  name: 'AgentActivity',
  props: {
    items: { type: Array as PropType<AgentActivityItem[]>, default: () => [] },
    title: { type: String, default: 'Agent activity' },
  },
  setup(props) {
    const completed = computed(() => props.items.filter(item => item.status === 'completed').length)
    const current = computed(() => props.items.find(item => item.status === 'running' || item.status === 'failed'))
    return () => h('section', { 'class': 'agent-activity', 'aria-live': 'polite' }, [
      h('header', { class: 'agent-activity__header' }, [
        h('span', { class: 'agent-activity__heading' }, [
          h('strong', props.title),
          current.value
            ? h('small', current.value.status === 'failed' ? `阻塞于 ${current.value.title}` : `正在执行 ${current.value.title}`)
            : h('small', completed.value === props.items.length && props.items.length ? '全部完成' : '等待开始'),
        ]),
        h('span', { class: 'agent-activity__count' }, `${completed.value}/${props.items.length}`),
      ]),
      h('ol', { class: 'agent-activity__body' }, props.items.map(item => h('li', {
        'class': 'agent-activity__item',
        'data-kind': item.kind,
        'data-status': item.status,
        'aria-current': item.status === 'running' ? 'step' : undefined,
        'key': item.id,
      }, [
        h('span', { 'class': 'agent-activity__kind', 'aria-hidden': 'true' }, [
          renderActivityKindIcon(item.kind),
        ]),
        h('span', { class: 'agent-activity__copy' }, [
          h('span', { class: 'agent-activity__row' }, [
            h('strong', item.title),
            renderStatus(item.status),
          ]),
          h('span', { class: 'agent-activity__meta' }, [
            h('small', { class: 'agent-activity__kind-label' }, activityKindLabel(item.kind)),
            item.duration ? h('small', item.duration) : null,
          ]),
          item.detail ? h('p', item.detail) : null,
        ]),
      ]))),
    ])
  },
})

export const AgentSidebar = defineComponent({
  name: 'AgentSidebar',
  props: {
    activeId: String,
    collapsed: Boolean,
    groups: { type: Array as PropType<AgentSidebarGroup[]>, default: () => [] },
    title: { type: String, default: 'AI workspace' },
  },
  emits: {
    'create': () => true,
    'select': (_item: AgentSidebarItem) => true,
    'update:activeId': (_value: string) => true,
    'update:collapsed': (_value: boolean) => true,
  },
  setup(props, { emit, slots }) {
    return () => h('aside', { 'class': 'agent-sidebar', 'data-collapsed': String(props.collapsed) }, [
      h('header', { class: 'agent-sidebar__header' }, [
        h('span', { class: 'agent-sidebar__heading' }, [
          h('span', { 'class': 'agent-sidebar__brand', 'aria-hidden': 'true' }, [renderChatIcon()]),
          !props.collapsed ? h('strong', props.title) : null,
        ]),
        h('button', {
          'class': 'agent-sidebar__toggle',
          'type': 'button',
          'aria-label': 'Toggle sidebar',
          'onClick': () => emit('update:collapsed', !props.collapsed),
        }, props.collapsed ? '›' : '‹'),
      ]),
      !props.collapsed
        ? h('button', { class: 'agent-sidebar__create', type: 'button', onClick: () => emit('create') }, [
            renderPlusIcon(),
            'New chat',
          ])
        : null,
      h('nav', { class: 'agent-sidebar__nav', role: 'navigation' }, props.groups.map(group => h('section', { class: 'agent-sidebar__group', key: group.id }, [
        !props.collapsed ? h('small', { class: 'agent-sidebar__group-label' }, group.label) : null,
        ...group.items.map(item => h('button', {
          'class': 'agent-sidebar__item',
          'data-active': String(item.id === props.activeId),
          'key': item.id,
          'type': 'button',
          'title': props.collapsed ? item.label : undefined,
          'onClick': () => {
            emit('update:activeId', item.id)
            emit('select', item)
          },
        }, [
          h('span', { 'class': 'agent-sidebar__mark', 'aria-hidden': 'true' }, [renderChatIcon()]),
          !props.collapsed
            ? h('span', { class: 'agent-sidebar__copy' }, [
                h('strong', item.label),
                item.meta ? h('small', item.meta) : null,
              ])
            : null,
          !props.collapsed && item.badge !== undefined ? h('b', { class: 'agent-sidebar__badge' }, String(item.badge)) : null,
        ])),
      ]))),
      slots.footer?.(),
    ])
  },
})

export const AgentContextCard = defineComponent({
  name: 'AgentContextCard',
  props: {
    chunks: { type: Array as PropType<AgentContextChunk[]>, default: () => [] },
    title: { type: String, default: 'Retrieved context' },
  },
  emits: { open: (_chunk: AgentContextChunk) => true },
  setup(props, { emit }) {
    return () => h('section', { class: 'agent-context-card' }, [
      h('header', { class: 'agent-context-card__header' }, [
        h('span', { class: 'agent-context-card__heading' }, [
          h('strong', props.title),
          h('small', props.chunks.length ? '来自检索结果的上下文片段' : '暂无检索上下文'),
        ]),
        h('span', { class: 'agent-context-card__count' }, `${props.chunks.length}`),
      ]),
      h('ol', { class: 'agent-context-card__list' }, props.chunks.map((chunk, index) => h('li', { key: chunk.id }, [
        h('article', { class: 'agent-context-card__chunk' }, [
          h('header', { class: 'agent-context-card__chunk-head' }, [
            h('span', { 'class': 'agent-context-card__index', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')),
            h('span', { class: 'agent-context-card__chunk-copy' }, [
              h('strong', chunk.label || chunk.source || 'Context'),
              chunk.sourceType ? h('small', { class: 'agent-context-card__type' }, chunk.sourceType) : null,
            ]),
          ]),
          h('p', { class: 'agent-context-card__quote' }, chunk.content),
          h('footer', { class: 'agent-context-card__chunk-foot' }, [
            h('small', chunk.source || 'Source'),
            h('button', { class: 'agent-context-card__open', type: 'button', onClick: () => emit('open', chunk) }, '打开'),
          ]),
        ]),
      ]))),
    ])
  },
})

export const AgentInsightCard = defineComponent({
  name: 'AgentInsightCard',
  props: {
    current: { type: Number, default: 0 },
    insights: { type: Array as PropType<AgentInsightItem[]>, default: () => [] },
    title: { type: String, default: 'Insights' },
  },
  emits: { 'action': (_item: AgentInsightItem) => true, 'update:current': (_value: number) => true },
  setup(props, { emit }) {
    const active = computed(() => props.insights[Math.min(Math.max(0, props.current), Math.max(0, props.insights.length - 1))])
    function move(delta: number) {
      if (!props.insights.length) { return }
      emit('update:current', (props.current + delta + props.insights.length) % props.insights.length)
    }
    return () => h('article', { 'class': 'agent-insight-card', 'data-tone': active.value?.tone || 'default' }, [
      h('header', { class: 'agent-insight-card__header' }, [
        h('span', { class: 'agent-insight-card__heading' }, [
          h('strong', props.title),
          h('small', active.value?.label || '运行指标'),
        ]),
        h('span', { class: 'agent-insight-card__count' }, `${props.insights.length ? props.current + 1 : 0}/${props.insights.length}`),
      ]),
      active.value
        ? h('div', { class: 'agent-insight-card__body' }, [
            active.value.value ? h('b', { class: 'agent-insight-card__value' }, active.value.value) : null,
            h('p', { class: 'agent-insight-card__copy' }, active.value.description),
          ])
        : h('p', { class: 'agent-insight-card__empty' }, '暂无洞察'),
      h('footer', { class: 'agent-insight-card__footer' }, [
        h('span', { class: 'agent-insight-card__nav' }, [
          h('button', { 'class': 'agent-insight-card__nav-btn', 'type': 'button', 'aria-label': 'Previous insight', 'onClick': () => move(-1) }, '‹'),
          h('button', { 'class': 'agent-insight-card__nav-btn', 'type': 'button', 'aria-label': 'Next insight', 'onClick': () => move(1) }, '›'),
        ]),
        active.value?.action
          ? h('button', { class: 'agent-insight-card__action', type: 'button', onClick: () => emit('action', active.value!) }, active.value.action)
          : null,
      ]),
    ])
  },
})

export const AgentSelectionActions = defineComponent({
  name: 'AgentSelectionActions',
  props: {
    actions: { type: Array as PropType<AgentSelectionAction[]>, default: () => [] },
    text: { type: String, required: true },
  },
  emits: { select: (_payload: { action: AgentSelectionAction, text: string }) => true },
  setup(props, { emit }) {
    return () => h('section', { class: 'agent-selection-actions' }, [
      h('p', { class: 'agent-selection-actions__quote' }, props.text),
      h('div', { class: 'agent-selection-actions__toolbar' }, props.actions.map(action => h('button', {
        class: 'agent-selection-actions__action',
        key: action.id,
        type: 'button',
        onClick: () => emit('select', { action, text: props.text }),
      }, action.label))),
    ])
  },
})

export const AgentDiffTable = defineComponent({
  name: 'AgentDiffTable',
  props: {
    columns: { type: Array as PropType<AgentTableColumn[]>, default: () => [] },
    rows: { type: Array as PropType<Array<AgentTableRow & { change?: 'add' | 'remove' | 'update' }>>, default: () => [] },
    title: { type: String, default: 'Proposed changes' },
  },
  emits: { accept: () => true, reject: () => true, select: (_row: AgentTableRow) => true },
  setup(props, { emit }) {
    return () => h('section', { class: 'agent-table agent-diff-table' }, [
      h('header', [h('strong', props.title), h('span', `${props.rows.length} rows`)]),
      h('div', { class: 'agent-table__scroll' }, [h('table', [
        h('thead', [h('tr', [h('th', 'Change'), ...props.columns.map(column => h('th', { key: column.key }, column.label))])]),
        h('tbody', props.rows.map(row => h('tr', { 'data-change': row.change || 'update', 'key': row.id, 'onClick': () => emit('select', row) }, [
          h('td', row.change === 'add' ? '+' : row.change === 'remove' ? '−' : '~'),
          ...props.columns.map(column => h('td', { key: column.key }, cellValue(row, column.key))),
        ]))),
      ])]),
      h('footer', [h('button', { type: 'button', onClick: () => emit('reject') }, 'Reject'), h('button', { type: 'button', onClick: () => emit('accept') }, 'Accept changes')]),
    ])
  },
})

export const AgentRecordsTable = defineComponent({
  name: 'AgentRecordsTable',
  props: {
    columns: { type: Array as PropType<AgentTableColumn[]>, default: () => [] },
    rows: { type: Array as PropType<AgentTableRow[]>, default: () => [] },
    sortBy: String,
    sortDirection: { type: String as PropType<'asc' | 'desc'>, default: 'asc' },
  },
  emits: { select: (_row: AgentTableRow) => true, sort: (_column: AgentTableColumn) => true },
  setup(props, { emit }) {
    return () =>
      h('div', { class: 'agent-table agent-records-table' }, [
        h('div', { class: 'agent-table__scroll' }, [
          h('table', [
            h('thead', [
              h('tr', props.columns.map(column =>
                h('th', { key: column.key }, [
                  column.sortable
                    ? h('button', { type: 'button', onClick: () => emit('sort', column) }, `${column.label}${props.sortBy === column.key ? props.sortDirection === 'asc' ? ' ↑' : ' ↓' : ''}`)
                    : column.label,
                ]),
              )),
            ]),
            h('tbody', props.rows.map(row =>
              h('tr', { key: row.id, onClick: () => emit('select', row) }, props.columns.map(column =>
                h('td', { key: column.key }, cellValue(row, column.key)),
              )),
            )),
          ]),
        ]),
      ])
  },
})

export const AgentFilterTable = defineComponent({
  name: 'AgentFilterTable',
  props: {
    className: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
    columns: { type: Array as PropType<AgentTableColumn[]>, default: () => [] },
    filter: { type: String, default: 'all' },
    filters: { type: Array as PropType<AgentFilterOption[]>, default: () => [] },
    rows: { type: Array as PropType<AgentTableRow[]>, default: () => [] },
    statusKey: { type: String, default: 'status' },
  },
  emits: { 'select': (_row: AgentTableRow) => true, 'update:filter': (_value: string) => true },
  setup(props, { emit }) {
    const visibleRows = computed(() => props.filter === 'all' ? props.rows : props.rows.filter(row => row[props.statusKey] === props.filter))
    return () => h('section', {
      class: cn('agent-filter-table grid gap-2.5', props.className),
    }, [
      h('nav', { class: 'flex flex-wrap gap-2' }, props.filters.map(filter => h('button', {
        'class': cn(
          'inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 py-0 text-[10px] font-bold leading-none',
          filter.value === props.filter
            ? 'border-teal-700 bg-emerald-50 text-teal-700'
            : 'border-slate-200 bg-white text-slate-500',
        ),
        'data-active': String(filter.value === props.filter),
        'key': filter.value,
        'type': 'button',
        'onClick': () => emit('update:filter', filter.value),
      }, [
        filter.label,
        filter.count !== undefined
          ? h('span', {
              class: 'agent-filter-table__count inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] leading-none tabular-nums',
            }, String(filter.count))
          : null,
      ]))),
      h(AgentRecordsTable, { columns: props.columns, rows: visibleRows.value, onSelect: (row: AgentTableRow) => emit('select', row) }),
    ])
  },
})

export const AgentCommandSearch = defineComponent({
  name: 'AgentCommandSearch',
  props: {
    emptyText: { type: String, default: 'No commands found' },
    items: { type: Array as PropType<AgentSearchItem[]>, default: () => [] },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search commands…' },
  },
  emits: { 'select': (_item: AgentSearchItem) => true, 'update:modelValue': (_value: string) => true },
  setup(props, { emit }) {
    const visibleItems = computed(() => {
      const query = props.modelValue.trim().toLowerCase()
      return query ? props.items.filter(item => `${item.label} ${item.description ?? ''} ${item.group ?? ''}`.toLowerCase().includes(query)) : props.items
    })
    const groupedItems = computed(() => {
      const groups = new Map<string, AgentSearchItem[]>()
      for (const item of visibleItems.value) {
        const key = item.group || 'Commands'
        const list = groups.get(key)
        if (list) { list.push(item) }
        else { groups.set(key, [item]) }
      }
      return [...groups.entries()].map(([label, items]) => ({ label, items }))
    })
    return () => h('section', { class: 'agent-command-search' }, [
      h('label', { class: 'agent-command-search__field' }, [
        h('span', { 'class': 'agent-command-search__icon', 'aria-hidden': 'true' }, [renderSearchIcon()]),
        h('input', { value: props.modelValue, placeholder: props.placeholder, onInput: (event: Event) => emit('update:modelValue', eventValue(event)) }),
      ]),
      groupedItems.value.length
        ? h('div', { class: 'agent-command-search__list' }, groupedItems.value.flatMap(group => [
            h('small', { class: 'agent-command-search__group', key: `group-${group.label}` }, group.label),
            ...group.items.map(item => h('button', {
              class: 'agent-command-search__item',
              key: item.id,
              type: 'button',
              onClick: () => emit('select', item),
            }, [
              h('span', { class: 'agent-command-search__copy' }, [
                h('strong', item.label),
                item.description ? h('small', item.description) : null,
              ]),
              item.shortcut ? h('kbd', item.shortcut) : null,
            ])),
          ]))
        : h('p', { class: 'agent-command-search__empty' }, props.emptyText),
    ])
  },
})

export const AgentFlowchart = defineComponent({
  name: 'AgentFlowchart',
  props: {
    nodes: { type: Array as PropType<AgentFlowNode[]>, default: () => [] },
    title: { type: String, default: 'Agent workflow' },
  },
  emits: { add: (_afterId?: string) => true, select: (_node: AgentFlowNode) => true },
  setup(props, { emit }) {
    const typeLabel = (type: AgentFlowNode['type']) => {
      if (type === 'trigger') { return '触发' }
      if (type === 'condition') { return '条件' }
      if (type === 'action') { return '动作' }
      return '结果'
    }
    return () => h('section', { class: 'agent-flowchart' }, [
      h('header', { class: 'agent-flowchart__header' }, [
        h('span', { class: 'agent-flowchart__heading' }, [
          h('strong', props.title),
          h('small', `${props.nodes.length} 个步骤`),
        ]),
        h('button', { class: 'agent-flowchart__add', type: 'button', onClick: () => emit('add', undefined) }, [renderPlusIcon(), 'Step']),
      ]),
      h('div', { class: 'agent-flowchart__canvas' }, props.nodes.flatMap((node, index): VNodeChild[] => [
        h('button', {
          'class': 'agent-flowchart__node',
          'data-type': node.type,
          'data-status': node.status || 'waiting',
          'key': node.id,
          'type': 'button',
          'onClick': () => emit('select', node),
        }, [
          h('span', { class: 'agent-flowchart__node-head' }, [
            h('span', { 'class': 'agent-flowchart__index', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')),
            h('small', { class: 'agent-flowchart__type' }, typeLabel(node.type)),
            node.status ? renderStatus(node.status) : null,
          ]),
          h('strong', node.label),
          node.detail ? h('span', { class: 'agent-flowchart__detail' }, node.detail) : null,
        ]),
        index < props.nodes.length - 1
          ? h('button', {
              'class': 'agent-flowchart__connector',
              'key': `${node.id}-connector`,
              'type': 'button',
              'aria-label': `Add after ${node.label}`,
              'onClick': () => emit('add', node.id),
            }, renderPlusIcon())
          : null,
      ])),
    ])
  },
})

export const AgentFineTune = defineComponent({
  name: 'AgentFineTune',
  props: {
    controls: { type: Array as PropType<AgentFineTuneControl[]>, default: () => [] },
    title: { type: String, default: 'Fine tune' },
  },
  emits: { 'apply': (_controls: AgentFineTuneControl[]) => true, 'update:controls': (_value: AgentFineTuneControl[]) => true },
  setup(props, { emit }) {
    const choiceGroupId = useId()

    function update(index: number, value: string) {
      const controls = props.controls.map((control, controlIndex) => controlIndex === index ? { ...control, value: control.type === 'number' ? Number(value) : value } : control)
      emit('update:controls', controls)
    }

    function renderControl(control: AgentFineTuneControl, index: number) {
      if (control.type === 'select') {
        return h('fieldset', { class: 'agent-fine-tune__field', key: control.label }, [
          h('legend', { class: 'agent-fine-tune__label' }, control.label),
          control.values?.length
            ? h('div', { class: 'agent-fine-tune__choices' }, control.values.map((option) => {
                const selected = String(control.value) === option.value
                return h('label', {
                  'class': 'agent-fine-tune__choice',
                  'data-selected': String(selected),
                  'key': option.value,
                }, [
                  h('input', {
                    checked: selected,
                    name: `${choiceGroupId}-${index}`,
                    type: 'radio',
                    value: option.value,
                    onChange: () => update(index, option.value),
                  }),
                  h('span', option.label),
                  h('span', { 'class': 'agent-fine-tune__choice-check', 'aria-hidden': 'true' }, selected ? '✓' : ''),
                ])
              }))
            : h('span', { class: 'agent-fine-tune__empty' }, 'No options'),
        ])
      }

      return h('label', { class: 'agent-fine-tune__field', key: control.label }, [
        h('span', { class: 'agent-fine-tune__label' }, control.label),
        h('input', {
          max: control.max,
          min: control.min,
          step: control.step,
          type: control.type,
          value: String(control.value),
          onInput: (event: Event) => update(index, eventValue(event)),
        }),
      ])
    }

    return () => h('section', { class: 'agent-fine-tune' }, [
      h('header', { class: 'agent-fine-tune__header' }, [
        h('span', { class: 'agent-fine-tune__heading' }, [
          h('strong', props.title),
          h('small', '调整生成参数后立即生效'),
        ]),
        h('span', { class: 'agent-fine-tune__count' }, `${props.controls.length} 项`),
      ]),
      h('div', { class: 'agent-fine-tune__grid' }, props.controls.map(renderControl)),
      h('footer', { class: 'agent-fine-tune__footer' }, [
        h('button', { class: 'agent-fine-tune__apply', type: 'button', onClick: () => emit('apply', props.controls) }, 'Apply changes'),
      ]),
    ])
  },
})
