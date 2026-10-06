import type { AgentThreadVersion } from '@varo-ui/ai'
import type { PropType, ShallowRef } from 'vue'
import type { AgentTask } from './types'
import type { AgentContextSource, AgentRetrievalItem, AgentSourceReceiptItem, AgentWorkspacePlacement } from './workspace-types'
import { useBodyScrollLock } from '@varo-ui/h5/primitives'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { cn } from '../../lib/cn'
import { agentPartStatusLabels } from './presentation'
import '../../styles/varo.css'
import '../../styles/varo-agent.css'
import './agent-workspace.css'

export type { AgentTask } from './types'
export type { AgentContextSource, AgentContextSourceStatus, AgentRetrievalItem, AgentRetrievalStatus, AgentSourceReceiptItem, AgentWorkspacePlacement } from './workspace-types'

function renderCloseMiniIcon() {
  return h('svg', {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 2.2,
    'viewBox': '0 0 24 24',
    'width': 12,
    'height': 12,
    'aria-hidden': 'true',
  }, [
    h('path', { d: 'M6 6l12 12M18 6 6 18' }),
  ])
}

function renderCheckIcon() {
  return h('svg', {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 2.2,
    'viewBox': '0 0 24 24',
    'width': 14,
    'height': 14,
    'aria-hidden': 'true',
  }, [h('path', { d: 'm5 12 4 4L19 6' })])
}
export const AgentTaskList = defineComponent({
  name: 'AgentTaskList',
  props: {
    tasks: { type: Array as PropType<AgentTask[]>, default: () => [] },
    title: { type: String, default: '执行进度' },
  },
  setup(props) {
    const completed = computed(() => props.tasks.filter(task => task.status === 'completed').length)
    const current = computed(() => props.tasks.find(task => task.status === 'running' || task.status === 'failed'))
    return () => h('section', { 'class': 'agent-task-list', 'aria-live': 'polite' }, [
      h('header', { class: 'agent-task-list__header' }, [
        h('span', { class: 'agent-task-list__heading' }, [
          h('strong', props.title),
          current.value
            ? h('small', current.value.status === 'failed' ? `阻塞于 ${current.value.title}` : `正在执行 ${current.value.title}`)
            : h('small', completed.value === props.tasks.length && props.tasks.length ? '全部完成' : '等待开始'),
        ]),
        h('span', { class: 'agent-task-list__count' }, `${completed.value}/${props.tasks.length}`),
      ]),
      h('ol', { class: 'agent-task-list__body' }, props.tasks.map((task, index) => {
        const progress = task.progress === undefined ? undefined : Math.min(100, Math.max(0, task.progress))
        return h('li', {
          'class': 'agent-task-list__item',
          'data-status': task.status,
          'aria-current': task.status === 'running' ? 'step' : undefined,
          'key': task.id,
        }, [
          h('span', { 'class': 'agent-task-list__marker', 'aria-hidden': 'true' }, [
            task.status === 'completed'
              ? renderCheckIcon()
              : task.status === 'failed'
                ? renderCloseMiniIcon()
                : task.status === 'running'
                  ? h('i')
                  : String(index + 1),
          ]),
          h('span', { class: 'agent-task-list__copy' }, [
            h('span', { class: 'agent-task-list__row' }, [
              h('strong', task.title),
              h('span', { class: 'agent-task-list__meta' }, [
                h('small', { class: 'agent-task-list__chip' }, agentPartStatusLabels[task.status]),
                task.meta ? h('small', task.meta) : null,
              ]),
            ]),
            task.description ? h('p', task.description) : null,
            progress === undefined
              ? null
              : h('span', { 'class': 'agent-task-list__track', 'aria-hidden': 'true' }, [
                  h('i', { style: { width: `${progress}%` } }),
                ]),
          ]),
        ])
      })),
    ])
  },
})

function renderWorkspaceIcon(kind: 'plug' | 'receipt' | 'branch') {
  const common = {
    'aria-hidden': 'true' as const,
    'fill': 'none',
    'height': 14,
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 1.8,
    'viewBox': '0 0 24 24',
    'width': 14,
  }
  if (kind === 'receipt') {
    return h('svg', common, [
      h('path', { d: 'M7 3h8l4 4v14H7V3Z' }),
      h('path', { d: 'M15 3v4h4M9 12h6M9 16h4' }),
    ])
  }
  if (kind === 'branch') {
    return h('svg', common, [
      h('circle', { cx: '6', cy: '6', r: '2.2' }),
      h('circle', { cx: '18', cy: '12', r: '2.2' }),
      h('circle', { cx: '6', cy: '18', r: '2.2' }),
      h('path', { d: 'M8.1 7.6v8.8M8.2 12H16' }),
    ])
  }
  return h('svg', common, [
    h('path', { d: 'M9 7V3M15 7V3' }),
    h('path', { d: 'M8 7h8v4a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4V7Z' }),
    h('path', { d: 'M12 15v6' }),
  ])
}

function workspaceActionClass(kind: 'quiet' | 'primary' | 'danger' = 'quiet') {
  return cn(
    'agent-workspace-card__action',
    kind === 'primary' && 'agent-workspace-card__action--primary',
    kind === 'danger' && 'agent-workspace-card__action--danger',
  )
}

const contextSourceStatusLabels = {
  available: '可用',
  connecting: '连接中',
  unavailable: '不可用',
} as const
const retrievalStatusLabels = {
  failed: '读取失败',
  queued: '排队中',
  read: '已读取',
  reading: '读取中',
  skipped: '已跳过',
} as const
const receiptStatusLabels = {
  failed: '读取失败',
  read: '已读取',
  skipped: '已跳过',
} as const

function renderCloseIcon() {
  return h('svg', {
    'aria-hidden': 'true',
    'class': 'h-5 w-5',
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 2,
    'viewBox': '0 0 24 24',
  }, [
    h('path', { d: 'M6 6l12 12M18 6 6 18' }),
  ])
}

export const AgentComposerScope = defineComponent({
  name: 'AgentComposerScope',
  props: {
    disabled: Boolean,
    sources: { type: Array as PropType<AgentContextSource[]>, default: () => [] },
    title: { type: String, default: '可访问来源' },
    usagePercent: { type: Number, default: 0 },
  },
  emits: {
    connect: (_source: AgentContextSource) => true,
    toggle: (_source: AgentContextSource, _enabled: boolean) => true,
  },
  setup(props, { emit }) {
    const usage = computed(() => {
      const value = Number.isFinite(props.usagePercent) ? props.usagePercent : 0
      return Math.min(100, Math.max(0, value))
    })
    const enabledCount = computed(() => props.sources.filter(source => source.enabled).length)
    const headingHint = computed(() => {
      if (!props.sources.length) { return '暂无可用来源' }
      if (enabledCount.value === 0) { return '尚未授权任何来源' }
      return `${enabledCount.value} 个来源已加入上下文`
    })
    return () => h('section', { 'class': 'agent-composer-scope', 'aria-label': props.title }, [
      h('header', { class: 'agent-workspace-card__header' }, [
        h('span', { class: 'agent-workspace-card__heading' }, [
          h('strong', props.title),
          h('small', headingHint.value),
        ]),
        h('span', { class: 'agent-workspace-card__count' }, `${enabledCount.value}/${props.sources.length}`),
      ]),
      props.sources.length
        ? h('div', { class: 'agent-workspace-card__body' }, props.sources.map((source) => {
            const status = source.status ?? 'available'
            return h('article', { 'class': 'agent-workspace-card__row', 'data-status': status, 'data-enabled': String(source.enabled), 'key': source.id }, [
              h('span', { 'class': 'agent-workspace-card__mark', 'aria-hidden': 'true' }, renderWorkspaceIcon('plug')),
              h('span', { class: 'agent-workspace-card__copy' }, [
                h('span', { class: 'agent-workspace-card__row-main' }, [
                  h('strong', source.label),
                  h('small', { class: 'agent-workspace-card__chip' }, contextSourceStatusLabels[status]),
                ]),
                source.description || source.meta
                  ? h('small', { class: 'agent-workspace-card__detail' }, source.description || source.meta)
                  : null,
              ]),
              status === 'available'
                ? h('button', {
                    'aria-label': `${source.enabled ? '停用' : '启用'}${source.label}`,
                    'aria-pressed': source.enabled,
                    'class': workspaceActionClass(source.enabled ? 'quiet' : 'primary'),
                    'disabled': props.disabled,
                    'type': 'button',
                    'onClick': () => emit('toggle', source, !source.enabled),
                  }, source.enabled ? '停用' : '启用')
                : status === 'unavailable'
                  ? h('button', {
                      'aria-label': `连接${source.label}`,
                      'class': workspaceActionClass('primary'),
                      'disabled': props.disabled,
                      'type': 'button',
                      'onClick': () => emit('connect', source),
                    }, '连接')
                  : h('small', { class: 'agent-workspace-card__chip' }, '连接中'),
            ])
          }))
        : h('p', { class: 'agent-workspace-card__empty' }, '暂无来源'),
      h('footer', { class: 'agent-composer-scope__meter' }, [
        h('span', { class: 'agent-workspace-card__row-main' }, [
          h('span', '上下文使用'),
          h('strong', `${usage.value}%`),
        ]),
        h('span', {
          'class': 'agent-composer-scope__track',
          'role': 'progressbar',
          'aria-label': '上下文使用量',
          'aria-valuemax': 100,
          'aria-valuemin': 0,
          'aria-valuenow': usage.value,
        }, [
          h('i', { style: { width: `${usage.value}%` } }),
        ]),
      ]),
    ])
  },
})

export const AgentRetrievalProgress = defineComponent({
  name: 'AgentRetrievalProgress',
  props: {
    items: { type: Array as PropType<AgentRetrievalItem[]>, default: () => [] },
    title: { type: String, default: '检索进度' },
  },
  emits: {
    retry: (_item: AgentRetrievalItem) => true,
  },
  setup(props, { emit }) {
    const settled = computed(() => props.items.filter(item => item.status === 'read' || item.status === 'skipped' || item.status === 'failed').length)
    const current = computed(() => props.items.find(item => item.status === 'reading' || item.status === 'failed'))
    const headingHint = computed(() => {
      if (current.value?.status === 'failed') { return `阻塞于 ${current.value.title}` }
      if (current.value) { return `正在读取 ${current.value.title}` }
      if (props.items.length && settled.value === props.items.length) { return '检索已完成' }
      return '等待检索'
    })
    return () => h('section', { 'class': 'agent-retrieval', 'aria-atomic': 'false', 'aria-live': 'polite' }, [
      h('header', { class: 'agent-workspace-card__header' }, [
        h('span', { class: 'agent-workspace-card__heading' }, [
          h('strong', props.title),
          h('small', headingHint.value),
        ]),
        h('span', { class: 'agent-workspace-card__count' }, `${settled.value}/${props.items.length}`),
      ]),
      props.items.length
        ? h('div', { class: 'agent-workspace-card__body' }, props.items.map((item, index) => h('article', { 'class': 'agent-workspace-card__row', 'data-status': item.status, 'key': item.id }, [
            h('span', { 'class': 'agent-workspace-card__mark', 'aria-hidden': 'true' }, item.status === 'reading' ? h('i') : String(index + 1).padStart(2, '0')),
            h('span', { class: 'agent-workspace-card__copy' }, [
              h('span', { class: 'agent-workspace-card__row-main' }, [
                h('strong', item.title),
                h('small', { class: 'agent-workspace-card__chip' }, retrievalStatusLabels[item.status]),
              ]),
              item.detail ? h('small', { class: 'agent-workspace-card__detail' }, item.detail) : null,
            ]),
            item.status === 'failed' && item.retryable
              ? h('button', {
                  'aria-label': `重试${item.title}`,
                  'class': workspaceActionClass('primary'),
                  'type': 'button',
                  'onClick': () => emit('retry', item),
                }, '重试')
              : null,
          ])))
        : h('p', { class: 'agent-workspace-card__empty' }, '暂无检索项'),
    ])
  },
})

export const AgentSourceReceipt = defineComponent({
  name: 'AgentSourceReceipt',
  props: {
    items: { type: Array as PropType<AgentSourceReceiptItem[]>, default: () => [] },
    summary: { type: String, default: '' },
    title: { type: String, default: '来源回执' },
  },
  emits: {
    connect: (_item: AgentSourceReceiptItem) => true,
    open: (_item: AgentSourceReceiptItem) => true,
  },
  setup(props, { emit }) {
    const readCount = computed(() => props.items.filter(item => item.status === 'read').length)
    const failedCount = computed(() => props.items.filter(item => item.status === 'failed').length)
    const headingHint = computed(() => {
      if (failedCount.value) { return `${failedCount.value} 个来源读取失败` }
      if (props.summary) { return props.summary }
      if (props.items.length && readCount.value === props.items.length) { return '全部来源已核对' }
      return '回答完成后核对来源'
    })
    return () => h('section', { 'class': 'agent-source-receipt', 'aria-label': props.title }, [
      h('header', { class: 'agent-workspace-card__header' }, [
        h('span', { class: 'agent-workspace-card__heading' }, [
          h('strong', props.title),
          h('small', headingHint.value),
        ]),
        h('span', { class: 'agent-workspace-card__count' }, `${readCount.value}/${props.items.length}`),
      ]),
      props.items.length
        ? h('div', { class: 'agent-workspace-card__body' }, props.items.map(item => h('article', { 'class': 'agent-workspace-card__row', 'data-status': item.status, 'key': item.id }, [
            h('span', { 'class': 'agent-workspace-card__mark', 'aria-hidden': 'true' }, renderWorkspaceIcon('receipt')),
            h('span', { class: 'agent-workspace-card__copy' }, [
              h('span', { class: 'agent-workspace-card__row-main' }, [
                h('strong', item.label),
                item.itemCount === undefined ? null : h('small', { class: 'agent-workspace-card__meta' }, `${item.itemCount} 项`),
              ]),
              item.detail ? h('small', { class: 'agent-workspace-card__detail' }, item.detail) : null,
              h('small', { class: 'agent-workspace-card__chip' }, receiptStatusLabels[item.status]),
            ]),
            item.status === 'read'
              ? h('button', {
                  'aria-label': `查看${item.label}`,
                  'class': workspaceActionClass(),
                  'type': 'button',
                  'onClick': () => emit('open', item),
                }, '查看')
              : item.status === 'failed'
                ? h('button', {
                    'aria-label': `连接${item.label}`,
                    'class': workspaceActionClass('primary'),
                    'type': 'button',
                    'onClick': () => emit('connect', item),
                  }, '连接')
                : null,
          ])))
        : h('p', { class: 'agent-workspace-card__empty' }, '暂无来源回执'),
    ])
  },
})

export const AgentTaskRunner = defineComponent({
  name: 'AgentTaskRunner',
  props: {
    busy: Boolean,
    tasks: { type: Array as PropType<AgentTask[]>, default: () => [] },
    title: { type: String, default: '执行计划' },
  },
  emits: {
    approve: (_task: AgentTask) => true,
    cancel: () => true,
    retry: (_task: AgentTask) => true,
  },
  setup(props, { emit }) {
    const actionableTasks = computed(() => {
      if (props.busy) { return [] }
      return props.tasks.filter(task =>
        (task.status === 'failed' && task.retryable)
        || (task.status === 'waiting' && task.requiresApproval),
      )
    })
    const canCancel = computed(() => props.busy || props.tasks.some(task => task.status === 'running'))
    return () => h('section', { class: 'agent-task-runner' }, [
      h(AgentTaskList, { tasks: props.tasks, title: props.title }),
      actionableTasks.value.length || canCancel.value
        ? h('div', { class: 'agent-task-runner__controls' }, [
            actionableTasks.value.length
              ? h('div', { class: 'agent-workspace-card__body' }, actionableTasks.value.map(task => h('article', { 'class': 'agent-workspace-card__row', 'data-status': task.status, 'key': task.id }, [
                  h('span', { class: 'agent-workspace-card__copy' }, [
                    h('strong', task.title),
                    task.description ? h('small', { class: 'agent-workspace-card__detail' }, task.description) : null,
                    h('small', { class: 'agent-workspace-card__chip' }, task.status === 'failed' ? '执行失败' : '等待确认'),
                  ]),
                  task.status === 'failed'
                    ? h('button', {
                        'aria-label': `重试${task.title}`,
                        'class': workspaceActionClass('primary'),
                        'type': 'button',
                        'onClick': () => emit('retry', task),
                      }, '重试')
                    : h('button', {
                        'aria-label': `批准${task.title}`,
                        'class': workspaceActionClass('primary'),
                        'type': 'button',
                        'onClick': () => emit('approve', task),
                      }, '批准'),
                ])))
              : null,
            canCancel.value
              ? h('div', { class: 'agent-task-runner__cancel' }, [
                  h('span', '任务正在执行'),
                  h('button', {
                    'aria-label': '取消当前任务',
                    'class': workspaceActionClass('danger'),
                    'type': 'button',
                    'onClick': () => emit('cancel'),
                  }, '取消'),
                ])
              : null,
          ])
        : null,
    ])
  },
})

export const AgentThreadVersions = defineComponent({
  name: 'AgentThreadVersions',
  props: {
    activeId: { type: String, default: '' },
    title: { type: String, default: '会话版本' },
    versions: { type: Array as PropType<readonly AgentThreadVersion[]>, default: () => [] },
  },
  emits: {
    branch: (_version: AgentThreadVersion) => true,
    pin: (_version: AgentThreadVersion) => true,
    select: (_version: AgentThreadVersion) => true,
  },
  setup(props, { emit }) {
    const displayVersions = computed(() => {
      const labels = new Map<string, string>()
      props.versions.forEach((version, index) => {
        labels.set(version.id, version.label || `版本 ${index + 1}`)
      })
      return props.versions.map((version, index) => ({
        active: version.id === props.activeId,
        label: version.label || `版本 ${index + 1}`,
        parentLabel: version.parentId ? labels.get(version.parentId) || version.parentId : '起始版本',
        version,
      }))
    })
    const active = computed(() => displayVersions.value.find(entry => entry.active))
    return () => h('section', { 'class': 'agent-thread-versions', 'aria-label': props.title }, [
      h('header', { class: 'agent-workspace-card__header' }, [
        h('span', { class: 'agent-workspace-card__heading' }, [
          h('strong', props.title),
          h('small', active.value ? `当前 ${active.value.label}` : '选择一个会话版本'),
        ]),
        h('span', { class: 'agent-workspace-card__count' }, `${props.versions.length} 个版本`),
      ]),
      displayVersions.value.length
        ? h('div', { 'class': 'agent-thread-versions__list', 'role': 'list', 'aria-label': '会话版本列表' }, displayVersions.value.map(entry =>
            h('article', {
              'class': 'agent-thread-versions__card',
              'data-active': String(entry.active),
              'key': entry.version.id,
              'role': 'listitem',
            }, [
              h('span', { class: 'agent-workspace-card__row-main' }, [
                h('span', { 'class': 'agent-workspace-card__mark', 'aria-hidden': 'true' }, renderWorkspaceIcon('branch')),
                h('strong', entry.label),
                entry.active
                  ? h('small', { class: 'agent-workspace-card__chip' }, '当前')
                  : entry.version.pinned
                    ? h('small', { class: 'agent-workspace-card__chip' }, '已固定')
                    : null,
              ]),
              h('p', { class: 'agent-workspace-card__detail' }, entry.version.summary || '暂无版本摘要'),
              h('span', { class: 'agent-thread-versions__meta' }, [
                h('small', `来源：${entry.parentLabel}`),
                entry.version.createdAt ? h('time', `创建：${entry.version.createdAt}`) : null,
              ]),
              h('footer', { class: 'agent-thread-versions__actions' }, [
                entry.active
                  ? null
                  : h('button', {
                      'aria-label': `选择${entry.label}`,
                      'class': workspaceActionClass('primary'),
                      'type': 'button',
                      'onClick': () => emit('select', entry.version),
                    }, '选择'),
                h('button', {
                  'aria-label': `从${entry.label}创建分支`,
                  'class': workspaceActionClass(),
                  'type': 'button',
                  'onClick': () => emit('branch', entry.version),
                }, '分支'),
                entry.version.pinned
                  ? null
                  : h('button', {
                      'aria-label': `固定${entry.label}`,
                      'class': workspaceActionClass(),
                      'type': 'button',
                      'onClick': () => emit('pin', entry.version),
                    }, '固定'),
              ]),
            ]),
          ))
        : h('p', { class: 'agent-workspace-card__empty' }, '暂无会话版本'),
    ])
  },
})

interface AgentShellModalEntry {
  close: () => void
  closeRef: ShallowRef<HTMLButtonElement | null>
  panelRef: ShallowRef<HTMLElement | null>
}

const agentShellModalStack: AgentShellModalEntry[] = []
let agentShellRestoreTarget: HTMLElement | null = null

function focusAgentShellModal(entry: AgentShellModalEntry) {
  void nextTick(() => {
    const top = agentShellModalStack[agentShellModalStack.length - 1]
    if (top === entry) { entry.closeRef.value?.focus({ preventScroll: true }) }
  })
}

function onAgentShellModalKeydown(event: KeyboardEvent) {
  const entry = agentShellModalStack[agentShellModalStack.length - 1]
  if (!entry) { return }
  if (event.key === 'Escape') {
    event.preventDefault()
    entry.close()
    return
  }
  if (event.key !== 'Tab' || !entry.panelRef.value) { return }
  const panel = entry.panelRef.value
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
  )).filter(element => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0)
  if (!focusable.length) {
    event.preventDefault()
    panel.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const activeElement = document.activeElement
  if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && (activeElement === last || !panel.contains(activeElement))) {
    event.preventDefault()
    first.focus()
  }
}

function registerAgentShellModal(entry: AgentShellModalEntry) {
  if (typeof document === 'undefined' || agentShellModalStack.includes(entry)) { return }
  if (!agentShellModalStack.length) {
    agentShellRestoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.addEventListener('keydown', onAgentShellModalKeydown)
  }
  agentShellModalStack.push(entry)
  focusAgentShellModal(entry)
}

function unregisterAgentShellModal(entry: AgentShellModalEntry) {
  const index = agentShellModalStack.indexOf(entry)
  if (index < 0) { return }
  const wasTop = index === agentShellModalStack.length - 1
  agentShellModalStack.splice(index, 1)
  if (agentShellModalStack.length) {
    if (wasTop) { focusAgentShellModal(agentShellModalStack[agentShellModalStack.length - 1]) }
    return
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', onAgentShellModalKeydown)
  }
  const focusTarget = agentShellRestoreTarget
  agentShellRestoreTarget = null
  if (focusTarget?.isConnected) { focusTarget.focus({ preventScroll: true }) }
}

export const AgentShell = defineComponent({
  name: 'AgentShell',
  props: {
    closeLabel: { type: String, default: '关闭工作区' },
    open: { type: Boolean, default: true },
    placement: { type: String as PropType<AgentWorkspacePlacement>, default: 'page' },
    title: { type: String, default: 'Agent 工作区' },
  },
  emits: {
    close: () => true,
  },
  setup(props, { emit, slots }) {
    const panelRef = shallowRef<HTMLElement | null>(null)
    const closeRef = shallowRef<HTMLButtonElement | null>(null)
    const visible = computed(() => props.open)
    const scrollLockEnabled = computed(() => props.placement === 'sheet')
    const scrollLock = useBodyScrollLock(visible, scrollLockEnabled)
    const modalEntry: AgentShellModalEntry = {
      close: () => emit('close'),
      closeRef,
      panelRef,
    }

    watch(
      [() => visible.value, () => scrollLockEnabled.value],
      ([open, enabled]) => {
        if (open && enabled) { registerAgentShellModal(modalEntry) }
        else { unregisterAgentShellModal(modalEntry) }
      },
      { immediate: true },
    )
    watch([() => visible.value, () => scrollLockEnabled.value], scrollLock.sync)
    onBeforeUnmount(() => unregisterAgentShellModal(modalEntry))
    onBeforeUnmount(scrollLock.dispose)

    return () => {
      if (!visible.value) { return null }
      const isSheet = scrollLockEnabled.value
      const panel = h('section', {
        'class': [
          'relative z-[1] flex min-h-0 w-full flex-col overflow-hidden border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-foreground)]',
          props.placement === 'page' && 'min-h-screen rounded-none',
          props.placement === 'docked' && 'max-h-[calc(100vh-32px)] max-w-[420px] rounded-[18px] shadow-[var(--varo-agent-shadow)]',
          isSheet && 'max-h-[86vh] rounded-t-[22px] pb-[env(safe-area-inset-bottom)] shadow-[0_-16px_40px_rgb(15_23_42_/_18%)]',
        ],
        'ref': panelRef,
        'role': isSheet ? 'dialog' : 'region',
        'tabindex': -1,
        'aria-label': props.title,
        'aria-modal': isSheet ? 'true' : undefined,
      }, [
        h('header', { class: 'flex min-h-14 flex-none items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-3.5 py-1.5' }, [
          h('strong', { class: 'truncate text-[14px] text-[var(--varo-agent-foreground)]' }, props.title),
          h('button', {
            'aria-label': props.closeLabel,
            'class': 'relative grid h-10 w-10 flex-none place-items-center rounded-[10px] border border-transparent bg-transparent text-[18px] leading-none text-[var(--varo-agent-muted)] transition-colors before:absolute before:-inset-0.5 before:content-[\'\'] hover:bg-[var(--varo-agent-fill)] motion-reduce:transition-none',
            'ref': closeRef,
            'type': 'button',
            'onClick': () => emit('close'),
          }, renderCloseIcon()),
        ]),
        h('div', {
          class: [
            'min-h-0 min-w-0 flex-1',
            props.placement === 'page' ? 'w-full' : 'max-h-[calc(86vh-56px-env(safe-area-inset-bottom))] overflow-y-auto',
          ],
        }, slots.default?.()),
      ])
      return h('div', {
        'class': [
          'box-border w-full text-[var(--varo-agent-foreground)]',
          props.placement === 'docked' && 'flex justify-end',
          isSheet && 'fixed inset-0 z-[100] flex items-end',
        ],
        'data-placement': props.placement,
      }, [
        isSheet
          ? h('button', {
              'aria-label': props.closeLabel,
              'class': 'fixed inset-0 z-0 h-full w-full border-0 bg-black/40 p-0',
              'tabindex': -1,
              'type': 'button',
              'onClick': () => emit('close'),
            })
          : null,
        panel,
      ])
    }
  },
})
