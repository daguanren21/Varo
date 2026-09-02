import type {
  AgentApprovalPart,
  AgentPartStatus,
  AgentStreamSnapshot,
  AgentStreamStatus,
  AgentToolPart,
} from '@varo-ui/ai'
import type { PropType } from 'vue'
import type { ClassValue } from '../../lib/cn'
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,

  shallowRef,

  watch,
} from 'vue'
import { cn } from '../../lib/cn'
import { AgentMarkdown } from './AgentMarkdown'
import './agent-ui.css'

export interface AgentChoice {
  description?: string
  disabled?: boolean
  label: string
  value: string
}

export interface AgentTask {
  id: string
  meta?: string
  progress?: number
  status: AgentPartStatus
  title: string
}

export interface AgentTraceStep {
  detail?: string
  duration?: string
  id: string
  status: AgentPartStatus
  title: string
}

export interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: 'assistant' | 'system' | 'user'
  timestamp?: string
}

export interface AgentArtifactItem {
  content?: string
  id: string
  kind?: 'code' | 'document' | 'file' | 'image'
  language?: string
  previewUrl?: string
  title: string
  url?: string
}

export interface AgentSourceItem {
  description?: string
  domain?: string
  id: string
  title: string
  url: string
}

export interface AgentAttachmentItem {
  id: string
  mimeType?: string
  name: string
  previewUrl?: string
  size?: string
}

const baseButton = 'inline-flex min-h-10 items-center justify-center rounded-xl border px-3 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45'
const primaryButton = `${baseButton} border-teal-700 bg-teal-700 text-white hover:bg-teal-800`
const quietButton = `${baseButton} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`

function partMark(status: AgentPartStatus) {
  if (status === 'completed') { return 'bg-emerald-500' }
  if (status === 'failed') { return 'bg-red-500' }
  if (status === 'running') { return 'agent-ui__pulse bg-teal-600' }
  return 'bg-slate-300'
}

export const AgentLoading = defineComponent({
  name: 'AgentLoading',
  props: {
    active: { type: Boolean, default: true },
    label: { type: String, default: 'Agent 正在处理' },
    startedAt: Number,
    variant: { type: String as PropType<'dots' | 'grid' | 'orbit'>, default: 'dots' },
  },
  setup(props) {
    const elapsed = shallowRef(0)
    let timer: ReturnType<typeof setInterval> | undefined
    const update = () => {
      const startedAt = props.startedAt ?? Date.now() - elapsed.value * 1000
      elapsed.value = Math.max(0, (Date.now() - startedAt) / 1000)
    }
    const stop = () => {
      clearInterval(timer)
      timer = undefined
    }
    const start = () => {
      if (timer || !props.active) { return }
      update()
      timer = setInterval(update, 100)
    }
    watch(() => props.active, active => (active ? start() : stop()))
    onMounted(start)
    onBeforeUnmount(stop)

    return () => h('div', { class: 'flex min-h-12 items-center gap-3 text-slate-700', role: 'status' }, [
      h('span', { 'class': 'agent-ui__loading flex h-6 w-8 items-center justify-center gap-1', 'aria-hidden': 'true' }, Array.from({ length: props.variant === 'grid' ? 6 : 3 }, (_, index) =>
        h('i', { class: 'h-1.5 w-1.5 rounded-full bg-teal-700', style: { animationDelay: `${index * 80}ms` } }))),
      h('span', { class: 'min-w-0 flex-1 truncate text-[13px] font-semibold' }, props.label),
      h('span', { class: 'text-[11px] tabular-nums text-slate-400' }, `${elapsed.value.toFixed(1)}s`),
    ])
  },
})

export const AgentMessage = defineComponent({
  name: 'AgentMessage',
  props: {
    label: String,
    role: { type: String as PropType<'assistant' | 'system' | 'user'>, default: 'assistant' },
    timestamp: String,
  },
  setup(props, { slots }) {
    return () => h('article', {
      'class': ['agent-message flex w-full min-w-0 items-start gap-2.5', props.role === 'user' && 'justify-end'],
      'data-role': props.role,
    }, [
      props.role !== 'user' ? h('span', { 'class': 'grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-teal-700 text-xs font-black text-white', 'aria-hidden': 'true' }, 'V') : null,
      h('div', { class: ['grid min-w-0 max-w-[82%] gap-1', props.role === 'user' && 'justify-items-end'] }, [
        props.label || props.timestamp
          ? h('header', { class: 'flex w-full items-center justify-between gap-3 px-1 text-[10px] text-slate-400' }, [
              h('span', props.label || (props.role === 'assistant' ? 'Varo Agent' : props.role === 'user' ? '你' : '系统')),
              props.timestamp ? h('time', props.timestamp) : null,
            ])
          : null,
        h('div', {
          class: [
            'min-w-11 max-w-full overflow-hidden break-words border px-3.5 py-2.5 shadow-sm',
            props.role === 'user'
              ? 'rounded-[16px_4px_16px_16px] border-teal-700 bg-teal-700 text-white'
              : 'rounded-[4px_16px_16px_16px] border-slate-200 bg-white text-slate-800',
          ],
        }, slots.default?.()),
      ]),
    ])
  },
})

export const AgentThinking = defineComponent({
  name: 'AgentThinking',
  props: {
    className: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    label: { type: String, default: 'Agent 执行轨迹' },
    open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    steps: { type: Array as PropType<AgentTraceStep[]>, default: () => [] },
  },
  emits: { 'update:open': (_value: boolean) => true },
  setup(props, { emit }) {
    const localOpen = shallowRef(props.defaultOpen)
    const currentOpen = computed(() => props.open ?? localOpen.value)
    const completed = computed(() => props.steps.filter(step => step.status === 'completed').length)

    return () => h('section', {
      'class': cn('agent-thinking overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className),
      'data-open': String(currentOpen.value),
    }, [
      h('button', {
        'aria-expanded': String(currentOpen.value),
        'class': 'agent-thinking__trigger',
        'type': 'button',
        'onClick': () => {
          const open = !currentOpen.value
          if (props.open === undefined) { localOpen.value = open }
          emit('update:open', open)
        },
      }, [
        h('span', { 'class': 'agent-thinking__icon', 'aria-hidden': 'true' }, [
          h('svg', {
            'viewBox': '0 0 24 24',
            'fill': 'none',
            'stroke': 'currentColor',
            'stroke-width': '1.8',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }, [
            h('path', { d: 'M12 3l1.45 3.75a3 3 0 0 0 1.8 1.8L19 10l-3.75 1.45a3 3 0 0 0-1.8 1.8L12 17l-1.45-3.75a3 3 0 0 0-1.8-1.8L5 10l3.75-1.45a3 3 0 0 0 1.8-1.8L12 3Z' }),
            h('path', { d: 'M5 3v4M3 5h4M19 17v4M17 19h4' }),
          ]),
        ]),
        h('span', { class: 'agent-thinking__copy' }, [
          h('strong', { class: 'agent-thinking__title' }, props.label),
          h('small', { class: 'agent-thinking__summary' }, `${completed.value}/${props.steps.length} 已完成`),
        ]),
        h('svg', {
          'class': 'agent-thinking__chevron',
          'viewBox': '0 0 24 24',
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        }, [
          h('path', { d: 'm6 9 6 6 6-6' }),
        ]),
      ]),
      currentOpen.value
        ? h('div', { class: 'agent-thinking__body' }, props.steps.map(step =>
            h('article', {
              'class': 'agent-thinking__step',
              'data-status': step.status,
              'key': step.id,
            }, [
              h('span', { 'class': ['agent-thinking__dot', partMark(step.status)], 'aria-hidden': 'true' }),
              h('span', { class: 'agent-thinking__step-copy' }, [
                h('span', { class: 'agent-thinking__step-header' }, [
                  h('strong', step.title),
                  step.duration ? h('small', step.duration) : null,
                ]),
                step.detail ? h('small', { class: 'agent-thinking__detail' }, step.detail) : null,
              ]),
            ]),
          ))
        : null,
    ])
  },
})

export const AgentToolChip = defineComponent({
  name: 'AgentToolChip',
  props: {
    compact: Boolean,
    tool: { type: Object as PropType<AgentToolPart>, required: true },
  },
  setup(props) {
    return () => h('span', { class: 'inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5' }, [
      h('i', { class: ['h-2 w-2 flex-none rounded-full', partMark(props.tool.status)] }),
      h('span', { class: 'grid min-w-0' }, [
        h('strong', { class: 'truncate text-[11px] text-slate-700' }, props.tool.name),
        props.tool.summary && !props.compact ? h('small', { class: 'truncate text-[10px] text-slate-400' }, props.tool.summary) : null,
      ]),
    ])
  },
})

export const AgentTaskList = defineComponent({
  name: 'AgentTaskList',
  props: {
    tasks: { type: Array as PropType<AgentTask[]>, default: () => [] },
    title: { type: String, default: '执行进度' },
  },
  setup(props) {
    const completed = computed(() => props.tasks.filter(task => task.status === 'completed').length)
    return () => h('section', { 'class': 'overflow-hidden rounded-2xl border border-slate-200 bg-white', 'aria-live': 'polite' }, [
      h('header', { class: 'flex min-h-11 items-center justify-between border-b border-slate-100 px-3.5' }, [
        h('strong', { class: 'text-[13px] text-slate-950' }, props.title),
        h('span', { class: 'text-[11px] tabular-nums text-slate-400' }, `${completed.value}/${props.tasks.length}`),
      ]),
      ...props.tasks.map((task, index) => h('div', { class: 'flex min-h-[50px] items-center gap-2.5 border-b border-slate-50 px-3.5 py-2 last:border-0', key: task.id }, [
        h('span', { class: ['grid h-6 w-6 flex-none place-items-center rounded-full border text-[10px] font-bold', task.status === 'completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'] }, task.status === 'completed' ? '✓' : String(index + 1)),
        h('span', { class: 'grid min-w-0 flex-1 gap-1' }, [
          h('span', { class: 'flex justify-between gap-2 text-xs font-semibold text-slate-700' }, [task.title, task.meta ? h('small', { class: 'text-slate-400' }, task.meta) : null]),
          task.progress === undefined ? null : h('span', { class: 'h-1 overflow-hidden rounded-full bg-slate-100' }, [h('i', { class: 'block h-full bg-teal-600', style: { width: `${Math.min(100, Math.max(0, task.progress))}%` } })]),
        ]),
      ])),
    ])
  },
})

export const AgentApproval = defineComponent({
  name: 'AgentApproval',
  props: {
    approveText: { type: String, default: '确认' },
    choices: { type: Array as PropType<AgentChoice[]>, default: () => [] },
    description: String,
    rejectText: { type: String, default: '拒绝' },
    title: { type: String, required: true },
    value: { type: String, default: '' },
  },
  emits: {
    'approve': (_value: string) => true,
    'reject': () => true,
    'update:value': (_value: string) => true,
  },
  setup(props, { emit, slots }) {
    return () => h('section', { 'class': 'grid gap-3.5 rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-sm', 'role': 'group', 'aria-label': props.title }, [
      h('header', { class: 'flex items-start gap-3' }, [
        h('span', { class: 'grid h-9 w-9 flex-none place-items-center rounded-xl bg-amber-100 font-black text-amber-700' }, '!'),
        h('span', { class: 'grid min-w-0 gap-0.5' }, [
          h('small', { class: 'font-extrabold tracking-widest text-amber-700' }, '需要你的确认'),
          h('strong', { class: 'text-[15px] leading-snug text-amber-950' }, props.title),
          props.description ? h('span', { class: 'text-xs leading-5 text-amber-800' }, props.description) : null,
        ]),
      ]),
      props.choices.length > 0
        ? h('div', { class: 'grid gap-2' }, props.choices.map(choice =>
            h('label', { class: ['flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-xs', choice.value === props.value ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700', choice.disabled && 'cursor-not-allowed opacity-45'], key: choice.value }, [
              h('input', { checked: choice.value === props.value, disabled: choice.disabled, name: `agent-approval-${props.title}`, type: 'radio', value: choice.value, onChange: () => emit('update:value', choice.value) }),
              h('span', { class: 'grid' }, [h('strong', choice.label), choice.description ? h('small', { class: 'text-slate-500' }, choice.description) : null]),
            ]),
          ))
        : null,
      slots.default?.(),
      h('footer', { class: 'flex justify-end gap-2' }, [
        h('button', { class: quietButton, type: 'button', onClick: () => emit('reject') }, props.rejectText),
        h('button', { class: primaryButton, disabled: props.choices.length > 0 && !props.value, type: 'button', onClick: () => emit('approve', props.value) }, props.approveText),
      ]),
    ])
  },
})

export const AgentRecommendation = defineComponent({
  name: 'AgentRecommendation',
  props: {
    acceptText: { type: String, default: '采用建议' },
    confidence: { type: Number, default: 80 },
    description: String,
    title: { type: String, required: true },
  },
  emits: { accept: () => true },
  setup(props, { emit, slots }) {
    const confidence = computed(() => Math.min(100, Math.max(0, props.confidence)))
    return () => h('section', { class: 'grid gap-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm' }, [
      h('header', { class: 'flex justify-between text-[10px] font-extrabold tracking-widest text-blue-700' }, [h('span', 'AGENT 建议'), h('span', `${confidence.value}%`)]),
      h('strong', { class: 'text-[15px] text-slate-950' }, props.title),
      props.description ? h('p', { class: 'm-0 text-xs leading-5 text-slate-600' }, props.description) : null,
      h('span', { class: 'h-1.5 overflow-hidden rounded-full bg-blue-100' }, [h('i', { class: 'block h-full rounded-full bg-blue-600', style: { width: `${confidence.value}%` } })]),
      slots.default?.(),
      h('footer', { class: 'flex justify-end gap-2' }, [slots.secondary?.(), h('button', { class: primaryButton, type: 'button', onClick: () => emit('accept') }, props.acceptText)]),
    ])
  },
})

export const AgentPromptSuggestions = defineComponent({
  name: 'AgentPromptSuggestions',
  props: { suggestions: { type: Array as PropType<string[]>, default: () => [] } },
  emits: { select: (_value: string) => true },
  setup(props, { emit }) {
    return () => h('div', { class: 'flex max-w-full gap-2 overflow-x-auto pb-1' }, props.suggestions.map(suggestion =>
      h('button', { class: 'min-h-9 flex-none rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-800', key: suggestion, type: 'button', onClick: () => emit('select', suggestion) }, suggestion),
    ))
  },
})

export const AgentComposer = defineComponent({
  name: 'AgentComposer',
  props: {
    busy: Boolean,
    maxLength: { type: Number, default: 4000 },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '给 Agent 发送消息…' },
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: {
    'submit': (_value: string) => true,
    'update:modelValue': (_value: string) => true,
  },
  setup(props, { emit, slots }) {
    const submit = (value = props.modelValue) => {
      const normalized = value.trim()
      if (!normalized || props.busy) { return }
      emit('submit', normalized)
    }
    return () => h('div', { class: 'grid w-full min-w-0 gap-2.5' }, [
      h(AgentPromptSuggestions, { suggestions: props.suggestions, onSelect: submit }),
      h('div', { class: 'flex min-h-14 min-w-0 items-center gap-2 rounded-[18px] border border-slate-200 bg-white p-2 shadow-lg' }, [
        slots.leading?.(),
        h('textarea', {
          class: 'max-h-40 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400',
          disabled: props.busy,
          maxlength: props.maxLength,
          placeholder: props.placeholder,
          rows: 1,
          value: props.modelValue,
          onInput: (event: Event) => {
            if (event.target instanceof HTMLTextAreaElement) { emit('update:modelValue', event.target.value) }
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          },
        }),
        slots.trailing?.(),
        h(
          'button',
          {
            'aria-label': props.busy ? 'Agent 正在处理' : '发送',
            'class': 'grid h-10 w-10 flex-none place-items-center self-center rounded-full bg-teal-700 text-lg font-bold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-45',
            'disabled': props.busy || !props.modelValue.trim(),
            'type': 'button',
            'onClick': () => submit(),
          },
          props.busy
            ? h(
                'span',
                { 'aria-hidden': 'true', 'class': 'flex items-center gap-0.5' },
                Array.from({ length: 3 }, (_, index) =>
                  h('i', {
                    class: 'agent-ui__pulse h-1 w-1 rounded-full bg-current',
                    style: { animationDelay: `${index * 90}ms` },
                  })),
              )
            : h('span', { 'aria-hidden': 'true', 'class': '-translate-y-px' }, '↑'),
        ),
      ]),
    ])
  },
})

export const AgentStream = defineComponent({
  name: 'AgentStream',
  props: {
    className: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
    content: { type: String, default: '' },
    cursor: { type: Boolean, default: true },
    error: String,
    final: Boolean,
    status: { type: String as PropType<AgentStreamStatus>, default: 'idle' },
  },
  emits: { retry: () => true },
  setup(props, { emit, slots }) {
    return () => h('div', { 'class': cn('agent-stream text-sm leading-7 text-slate-800', props.className), 'data-status': props.status, 'aria-live': 'polite' }, [
      h(AgentMarkdown, { content: props.content, final: props.final || props.status === 'completed' }),
      props.cursor && props.status === 'streaming' ? h('i', { class: 'agent-ui__cursor ml-1 inline-block h-[1.15em] w-0.5 rounded-full bg-teal-700 align-[-.18em]' }) : null,
      props.status === 'failed' ? h('div', { class: 'mt-2.5 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700', role: 'alert' }, [h('span', props.error || '生成失败，请重试'), h('button', { class: quietButton, type: 'button', onClick: () => emit('retry') }, '重试')]) : null,
      props.status === 'completed' ? h('div', { class: 'mt-3 flex flex-wrap gap-2' }, slots.actions?.()) : null,
    ])
  },
})

export const AgentResponseActions = defineComponent({
  name: 'AgentResponseActions',
  props: { content: { type: String, default: '' }, disabled: Boolean },
  emits: { copy: () => true, dislike: () => true, like: () => true, retry: () => true },
  setup(props, { emit }) {
    const copied = shallowRef(false)
    let timer: ReturnType<typeof setTimeout> | undefined
    const copy = async () => {
      if (props.disabled) { return }
      await navigator.clipboard.writeText(props.content)
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, 1200)
      emit('copy')
    }
    onBeforeUnmount(() => clearTimeout(timer))
    const action = (label: string, value: string, handler: () => void) => h('button', { 'aria-label': label, 'class': quietButton, 'disabled': props.disabled, 'type': 'button', 'onClick': handler }, value)
    return () => h('div', { 'class': 'flex flex-wrap gap-1.5', 'role': 'toolbar', 'aria-label': '回答操作' }, [
      action('复制回答', copied.value ? '已复制' : '复制', copy),
      action('重新生成', '重试', () => emit('retry')),
      action('有帮助', '赞', () => emit('like')),
      action('没有帮助', '踩', () => emit('dislike')),
    ])
  },
})

export const AgentArtifact = defineComponent({
  name: 'AgentArtifact',
  props: { artifact: { type: Object as PropType<AgentArtifactItem>, required: true } },
  emits: { open: (_artifact: AgentArtifactItem) => true },
  setup(props, { emit }) {
    return () =>
      h('article', { class: 'overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg' }, [
        h('header', { class: 'flex min-h-14 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4' }, [
          h('span', { class: 'grid min-w-0 gap-0.5' }, [
            h('small', { class: 'text-[9px] font-black uppercase tracking-[0.16em] text-teal-300' }, props.artifact.kind || 'artifact'),
            h('strong', { class: 'truncate text-xs text-slate-100' }, props.artifact.title),
          ]),
          h(
            'button',
            {
              class: 'min-h-8 flex-none rounded-lg border border-slate-700 bg-slate-800 px-3 text-[10px] font-bold text-slate-200 transition-colors hover:border-teal-500 hover:text-white',
              type: 'button',
              onClick: () => emit('open', props.artifact),
            },
            '打开',
          ),
        ]),
        props.artifact.content
          ? h(
              'pre',
              { class: 'm-0 max-h-72 overflow-auto whitespace-pre-wrap break-words bg-slate-950 px-4 py-3.5 font-mono text-[11px] leading-5 text-slate-200' },
              props.artifact.content,
            )
          : null,
        props.artifact.previewUrl
          ? h('img', { alt: props.artifact.title, class: 'block max-h-80 w-full bg-slate-950 object-contain', src: props.artifact.previewUrl })
          : null,
      ])
  },
})

export const AgentSourceList = defineComponent({
  name: 'AgentSourceList',
  props: { sources: { type: Array as PropType<AgentSourceItem[]>, default: () => [] }, title: { type: String, default: '来源' } },
  emits: { open: (_source: AgentSourceItem) => true },
  setup(props, { emit }) {
    return () =>
      h('section', { class: 'grid gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm' }, [
        h('header', { class: 'flex items-end justify-between gap-3 px-0.5' }, [
          h('span', { class: 'grid gap-0.5' }, [
            h('small', { class: 'text-[9px] font-black uppercase tracking-[0.16em] text-teal-700' }, 'Sources'),
            h('strong', { class: 'text-xs text-slate-800' }, props.title),
          ]),
          h('small', { class: 'rounded-full bg-white px-2 py-1 text-[9px] font-bold text-slate-500 ring-1 ring-slate-200' }, `${props.sources.length} refs`),
        ]),
        h(
          'div',
          { class: 'grid gap-2' },
          props.sources.map((source, index) =>
            h(
              'a',
              {
                class: 'group flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm transition-all hover:-translate-y-px hover:border-teal-300 hover:shadow-md',
                href: source.url,
                key: source.id,
                rel: 'noreferrer noopener',
                target: '_blank',
                onClick: () => emit('open', source),
              },
              [
                h('span', { class: 'grid h-8 w-8 flex-none place-items-center rounded-xl bg-teal-50 text-[11px] font-black text-teal-700' }, String(index + 1).padStart(2, '0')),
                h('span', { class: 'grid min-w-0 flex-1 gap-0.5' }, [
                  h('strong', { class: 'truncate text-[11px] text-slate-800' }, source.title),
                  h('small', { class: 'truncate text-[9px] text-slate-400' }, source.domain || source.description || source.url),
                ]),
                h('span', { 'aria-hidden': 'true', 'class': 'text-xs text-slate-300 transition-colors group-hover:text-teal-600' }, '↗'),
              ],
            ),
          ),
        ),
      ])
  },
})

export const AgentAttachmentList = defineComponent({
  name: 'AgentAttachmentList',
  props: { attachments: { type: Array as PropType<AgentAttachmentItem[]>, default: () => [] } },
  emits: { remove: (_item: AgentAttachmentItem) => true },
  setup(props, { emit }) {
    return () =>
      h('section', { class: 'grid gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm' }, [
        h('header', { class: 'flex items-end justify-between gap-3 px-0.5' }, [
          h('span', { class: 'grid gap-0.5' }, [
            h('small', { class: 'text-[9px] font-black uppercase tracking-[0.16em] text-teal-700' }, 'Files'),
            h('strong', { class: 'text-xs text-slate-800' }, '附件'),
          ]),
          h('small', { class: 'text-[9px] font-bold text-slate-400' }, `${props.attachments.length} items`),
        ]),
        h(
          'div',
          { class: 'grid gap-2' },
          props.attachments.map(item =>
            h('article', { class: 'flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 shadow-sm', key: item.id }, [
              item.previewUrl
                ? h('img', { alt: '', class: 'h-9 w-9 flex-none rounded-xl object-cover', src: item.previewUrl })
                : h(
                    'i',
                    { class: 'grid h-9 w-9 flex-none place-items-center rounded-xl bg-slate-900 text-[9px] font-black not-italic text-white' },
                    item.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE',
                  ),
              h('span', { class: 'grid min-w-0 flex-1 gap-0.5' }, [
                h('strong', { class: 'truncate text-[11px] text-slate-800' }, item.name),
                h('small', { class: 'text-[9px] text-slate-400' }, [item.size, item.mimeType].filter(Boolean).join(' · ')),
              ]),
              h(
                'button',
                {
                  'aria-label': `移除 ${item.name}`,
                  'class': 'agent-attachments__remove agent-action--danger min-h-8 flex-none rounded-lg border-0 bg-transparent px-2 text-[10px] font-bold text-[var(--varo-agent-muted)] transition-colors hover:bg-[var(--varo-agent-danger-soft)] hover:text-[var(--varo-agent-danger)] focus-visible:outline-[var(--varo-agent-danger)]',
                  'type': 'button',
                  'onClick': () => emit('remove', item),
                },
                '移除',
              ),
            ]),
          ),
        ),
      ])
  },
})

export const AgentConversation = defineComponent({
  name: 'AgentConversation',
  props: { messages: { type: Array as PropType<AgentConversationMessage[]>, default: () => [] } },
  setup(props) {
    return () => h('div', { 'class': 'grid gap-3', 'role': 'log', 'aria-live': 'polite' }, props.messages.map(message => h(AgentMessage, { key: message.id, label: message.label, role: message.role, timestamp: message.timestamp }, { default: () => h(AgentMarkdown, { content: message.content, final: true }) })))
  },
})

function approvalChoices(approval: AgentApprovalPart): AgentChoice[] {
  return approval.choices ?? []
}

export const AgentEventRenderer = defineComponent({
  name: 'AgentEventRenderer',
  props: { snapshot: { type: Object as PropType<AgentStreamSnapshot>, required: true } },
  emits: { approve: (_value: string) => true, reject: () => true, retry: () => true },
  setup(props, { emit, slots }) {
    const approvalValue = shallowRef('')
    const traces = computed<AgentTraceStep[]>(() => props.snapshot.reasoning.map(part => ({
      detail: part.content,
      duration: part.durationMs === undefined ? undefined : `${(part.durationMs / 1000).toFixed(1)}s`,
      id: part.id,
      status: part.status,
      title: part.title,
    })))

    return () => h('div', { 'class': 'grid gap-3', 'data-status': props.snapshot.status }, [
      props.snapshot.reasoning.length > 0 ? h(AgentThinking, { label: '推理过程', defaultOpen: props.snapshot.status === 'streaming', steps: traces.value }) : null,
      props.snapshot.tools.length > 0 ? h('div', { class: 'flex flex-wrap gap-2' }, props.snapshot.tools.map(tool => h(AgentToolChip, { key: tool.id, tool }))) : null,
      props.snapshot.message ? h(AgentMessage, { role: props.snapshot.message.role }, { default: () => h(AgentStream, { content: props.snapshot.message?.visible, error: props.snapshot.error?.message, final: props.snapshot.message?.final, status: props.snapshot.status, onRetry: () => emit('retry') }, { actions: slots.actions }) }) : null,
      props.snapshot.status === 'streaming' && !props.snapshot.message?.visible ? h(AgentLoading, { label: '正在生成回答' }) : null,
      props.snapshot.approval?.status === 'waiting'
        ? h(AgentApproval, {
            'choices': approvalChoices(props.snapshot.approval),
            'description': props.snapshot.approval.description,
            'title': props.snapshot.approval.title,
            'value': approvalValue.value,
            'onUpdate:value': (value: string) => { approvalValue.value = value },
            'onApprove': (value: string) => emit('approve', value),
            'onReject': () => emit('reject'),
          })
        : null,
      slots.default?.(),
    ])
  },
})

export { AgentMarkdown }
export * from './advanced'
export type { AgentStreamSnapshot, AgentStreamStatus, AgentToolPart } from '@varo-ui/ai'
