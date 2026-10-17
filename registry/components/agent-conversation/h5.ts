import type { AgentPartStatus, AgentStreamSnapshot, AgentStreamStatus, AgentToolPart } from '@varo-ui/ai'
import type { PropType } from 'vue'
import type { ClassValue } from '../../lib/cn'
import type { AgentChoice, AgentConversationMessage, AgentTraceStep } from './types'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { cn } from '../../lib/cn'
import { AgentMarkdown } from './AgentMarkdown'
import { agentStreamIsFinal, agentStreamNotice, agentTraceDetail, agentTraceDuration } from './presentation'
import '../../styles/varo.css'
import '../../styles/varo-agent.css'
import './agent-conversation.css'
import './agent-markdown.css'

export { AgentMarkdown }
export type { AgentChoice, AgentConversationMessage, AgentTraceStep } from './types'
export type { AgentStreamSnapshot, AgentStreamStatus, AgentToolPart } from '@varo-ui/ai'

const quietButton = 'inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 text-xs font-bold text-[var(--varo-agent-foreground)] transition-colors hover:bg-[var(--varo-agent-surface-strong)] disabled:cursor-not-allowed disabled:opacity-45'
function partMark(status: AgentPartStatus) {
  if (status === 'completed') { return 'bg-[var(--varo-agent-success)]' }
  if (status === 'failed') { return 'bg-[var(--varo-agent-danger)]' }
  if (status === 'running') { return 'agent-ui__pulse bg-[var(--varo-agent-primary)]' }
  return 'bg-[var(--varo-agent-border-strong)]'
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

    return () => h('div', { class: 'agent-loading flex min-h-12 items-center gap-3 text-[var(--varo-agent-foreground)]', role: 'status' }, [
      h('span', { 'class': 'agent-ui__loading flex h-6 w-8 items-center justify-center gap-1', 'aria-hidden': 'true' }, Array.from({ length: props.variant === 'grid' ? 6 : 3 }, (_, index) =>
        h('i', { class: 'h-1.5 w-1.5 rounded-full bg-[var(--varo-agent-primary)]', style: { animationDelay: `${index * 80}ms` } }))),
      h('span', { class: 'min-w-0 flex-1 truncate text-[13px] font-semibold' }, props.label),
      h('span', { class: 'text-[12px] tabular-nums text-[var(--varo-agent-muted)]' }, `${elapsed.value.toFixed(1)}s`),
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
      props.role !== 'user' ? h('span', { 'class': 'grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-[var(--varo-agent-primary)] text-xs font-black text-[var(--varo-agent-primary-foreground)]', 'aria-hidden': 'true' }, 'V') : null,
      h('div', { class: ['grid min-w-0 max-w-[82%] gap-1', props.role === 'user' && 'justify-items-end'] }, [
        props.label || props.timestamp
          ? h('header', { class: 'flex w-full items-center justify-between gap-3 px-1 text-[11px] text-[var(--varo-agent-muted)]' }, [
              h('span', props.label || (props.role === 'assistant' ? 'Varo Agent' : props.role === 'user' ? '你' : '系统')),
              props.timestamp ? h('time', props.timestamp) : null,
            ])
          : null,
        h('div', {
          class: [
            'min-w-11 max-w-full overflow-hidden break-words border px-3.5 py-2.5 shadow-sm',
            props.role === 'user'
              ? 'rounded-[16px_4px_16px_16px] border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] text-[var(--varo-agent-primary-foreground)]'
              : 'rounded-[4px_16px_16px_16px] border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-foreground)]',
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
      'class': cn('agent-thinking overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
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
                  agentTraceDuration(step) ? h('small', agentTraceDuration(step)) : null,
                ]),
                agentTraceDetail(step) ? h('small', { class: 'agent-thinking__detail' }, agentTraceDetail(step)) : null,
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
    return () => h('span', { class: 'inline-flex max-w-full items-center gap-2 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-2.5 py-1.5' }, [
      h('i', { class: ['h-2 w-2 flex-none rounded-full', partMark(props.tool.status)] }),
      h('span', { class: 'grid min-w-0' }, [
        h('strong', { class: 'truncate text-[12px] text-[var(--varo-agent-foreground)]' }, props.tool.name),
        props.tool.summary && !props.compact ? h('small', { class: 'truncate text-[11px] text-[var(--varo-agent-muted)]' }, props.tool.summary) : null,
      ]),
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
    return () => h('section', { 'class': 'agent-approval', 'role': 'group', 'aria-label': props.title }, [
      h('header', { class: 'agent-approval__header' }, [
        h('span', { 'class': 'agent-approval__icon', 'aria-hidden': 'true' }, [
          h('svg', {
            'fill': 'none',
            'stroke': 'currentColor',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': 1.8,
            'viewBox': '0 0 24 24',
          }, [
            h('path', { d: 'm12 3-7 3v5c0 4.6 3 8.6 7 10 4-1.4 7-5.4 7-10V6z' }),
            h('path', { d: 'M12 8v4 M12 16h.01' }),
          ]),
        ]),
        h('span', { class: 'agent-approval__heading' }, [
          h('small', { class: 'agent-approval__eyebrow' }, '需要你的确认'),
          h('strong', { class: 'agent-approval__title' }, props.title),
          props.description
            ? h('span', { class: 'agent-approval__description' }, props.description)
            : null,
        ]),
      ]),
      props.choices.length > 0
        ? h('div', { class: 'agent-approval__choices' }, props.choices.map(choice =>
            h('label', {
              'class': 'agent-approval__choice',
              'data-disabled': String(Boolean(choice.disabled)),
              'data-selected': String(choice.value === props.value),
              'key': choice.value,
            }, [
              h('input', {
                class: 'agent-approval__radio',
                checked: choice.value === props.value,
                disabled: choice.disabled,
                name: `agent-approval-${props.title}`,
                type: 'radio',
                value: choice.value,
                onChange: () => emit('update:value', choice.value),
              }),
              h('span', { class: 'agent-approval__choice-copy' }, [
                h('strong', choice.label),
                choice.description
                  ? h('small', choice.description)
                  : null,
              ]),
            ]),
          ))
        : null,
      slots.default?.(),
      h('footer', { class: 'agent-approval__footer' }, [
        h('button', {
          class: 'agent-approval__reject',
          type: 'button',
          onClick: () => emit('reject'),
        }, props.rejectText),
        h('button', {
          class: 'agent-approval__approve',
          disabled: props.choices.length > 0 && !props.value,
          type: 'button',
          onClick: () => emit('approve', props.value),
        }, props.approveText),
      ]),
    ])
  },
})
export const AgentPromptSuggestions = defineComponent({
  name: 'AgentPromptSuggestions',
  props: {
    disabled: Boolean,
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: { select: (_value: string) => true },
  setup(props, { emit }) {
    return () => h('div', { class: 'flex max-w-full gap-2 overflow-x-auto pb-1' }, props.suggestions.map(suggestion =>
      h('button', {
        class: 'min-h-9 flex-none rounded-full border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 text-[12px] font-semibold text-[var(--varo-agent-text)] hover:border-[var(--varo-agent-primary)] hover:text-[var(--varo-agent-primary)] disabled:cursor-not-allowed disabled:opacity-45',
        disabled: props.disabled,
        key: suggestion,
        type: 'button',
        onClick: () => { if (!props.disabled) { emit('select', suggestion) } },
      }, suggestion),
    ))
  },
})

export const AgentComposer = defineComponent({
  name: 'AgentComposer',
  props: {
    ariaLabel: { type: String, default: 'Agent 输入' },
    busy: Boolean,
    disabled: Boolean,
    maxLength: { type: Number, default: 4000 },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '给 Agent 发送消息…' },
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
    submitDisabled: Boolean,
  },
  emits: {
    'submit': (_value: string) => true,
    'update:modelValue': (_value: string) => true,
  },
  setup(props, { emit, slots }) {
    let composing = false
    const reconcileInput = (input: HTMLTextAreaElement) => {
      void nextTick(() => {
        if (!composing && input.value !== props.modelValue) { input.value = props.modelValue }
      })
    }
    const submit = (value = props.modelValue) => {
      const normalized = value.trim()
      if (!normalized || props.busy || props.disabled || props.submitDisabled) { return }
      emit('submit', normalized)
    }
    return () => h('div', { class: 'agent-composer grid w-full min-w-0 grid-cols-1 gap-2.5' }, [
      h(AgentPromptSuggestions, { disabled: props.busy || props.disabled || props.submitDisabled, suggestions: props.suggestions, onSelect: submit }),
      h('div', { class: 'agent-composer__shell flex min-h-14 min-w-0 items-center gap-2 rounded-[18px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-2 shadow-lg' }, [
        slots.leading?.(),
        h('textarea', {
          'aria-label': props.ariaLabel,
          'class': 'max-h-40 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm leading-5 text-[var(--varo-agent-foreground)] outline-none placeholder:text-[var(--varo-agent-muted)]',
          'disabled': props.busy || props.disabled,
          'maxlength': props.maxLength,
          'placeholder': props.placeholder,
          'rows': 1,
          'value': props.modelValue,
          'onInput': (event: Event) => {
            if (props.busy || props.disabled) { return }
            if (event.target instanceof HTMLTextAreaElement) {
              emit('update:modelValue', event.target.value)
              reconcileInput(event.target)
            }
          },
          'onCompositionstart': () => { composing = true },
          'onCompositionend': (event: CompositionEvent) => {
            composing = false
            if (event.target instanceof HTMLTextAreaElement) { reconcileInput(event.target) }
          },
          'onKeydown': (event: KeyboardEvent) => {
            if (props.busy || props.disabled || event.isComposing) { return }
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
            'class': 'grid h-11 w-11 flex-none place-items-center self-center rounded-full bg-[var(--varo-agent-primary)] text-lg font-bold text-[var(--varo-agent-primary-foreground)] shadow-sm transition-transform active:translate-y-px disabled:opacity-45',
            'disabled': props.busy || props.disabled || props.submitDisabled || !props.modelValue.trim(),
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
            : h('svg', {
                'fill': 'none',
                'stroke': 'currentColor',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': 1.9,
                'viewBox': '0 0 24 24',
                'width': 20,
                'height': 20,
                'aria-hidden': 'true',
              }, [
                h('path', { d: 'm4 12 16-8-5 16-3.5-6.5L4 12Z' }),
                h('path', { d: 'M11.5 13.5 20 4' }),
              ]),
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
    return () => h('div', { 'class': cn('agent-stream text-sm leading-7 text-[var(--varo-agent-foreground)]', props.className), 'data-status': props.status, 'aria-live': 'polite' }, [
      h(AgentMarkdown, { content: props.content, final: props.final || agentStreamIsFinal(props.status) }),
      props.cursor && props.status === 'streaming' ? h('i', { class: 'agent-ui__cursor ml-1 inline-block h-[1.15em] w-0.5 rounded-full bg-[var(--varo-agent-primary)] align-[-.18em]' }) : null,
      agentStreamNotice(props.status) ? h('p', { class: 'mt-2 text-xs text-[var(--varo-agent-muted)]', role: 'status' }, agentStreamNotice(props.status)) : null,
      props.status === 'failed' ? h('div', { class: 'mt-2.5 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[var(--varo-agent-danger-soft)] px-3 py-2.5 text-xs text-[var(--varo-agent-danger)]', role: 'alert' }, [h('span', props.error || '生成失败，请重试'), h('button', { class: quietButton, type: 'button', onClick: () => emit('retry') }, '重试')]) : null,
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
export const AgentConversation = defineComponent({
  name: 'AgentConversation',
  props: { messages: { type: Array as PropType<AgentConversationMessage[]>, default: () => [] } },
  setup(props) {
    return () => h('div', { 'class': 'grid gap-3', 'role': 'log', 'aria-live': 'polite' }, props.messages.map(message => h(AgentMessage, { key: message.id, label: message.label, role: message.role, timestamp: message.timestamp }, { default: () => h(AgentMarkdown, { content: message.content, final: true }) })))
  },
})
export const AgentEventRenderer = defineComponent({
  name: 'AgentEventRenderer',
  props: { snapshot: { type: Object as PropType<AgentStreamSnapshot>, required: true } },
  emits: { approve: (_value: string) => true, reject: () => true, retry: () => true },
  setup(props, { emit, slots }) {
    const approvalValue = shallowRef('')

    return () => h('div', { 'class': 'grid gap-3', 'data-status': props.snapshot.status }, [
      props.snapshot.reasoning.length > 0 ? h(AgentThinking, { label: '推理过程', defaultOpen: props.snapshot.status === 'streaming', steps: props.snapshot.reasoning }) : null,
      props.snapshot.tools.length > 0 ? h('div', { class: 'flex flex-wrap gap-2' }, props.snapshot.tools.map(tool => h(AgentToolChip, { key: tool.id, tool }))) : null,
      props.snapshot.message || props.snapshot.error ? h(AgentMessage, { role: props.snapshot.message?.role ?? 'assistant' }, { default: () => h(AgentStream, { content: props.snapshot.message?.visible, error: props.snapshot.error?.message, final: props.snapshot.message?.final, status: props.snapshot.status, onRetry: () => emit('retry') }, { actions: slots.actions }) }) : null,
      props.snapshot.status === 'streaming' && !props.snapshot.message?.visible ? h(AgentLoading, { label: '正在生成回答' }) : null,
      props.snapshot.approval?.status === 'waiting'
        ? h(AgentApproval, {
            'choices': props.snapshot.approval.choices,
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
