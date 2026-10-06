import type { PropType } from 'vue'
import type { AgentArtifactItem, AgentAttachmentItem, AgentSourceItem } from './advanced-types'
import { computed, defineComponent, h } from 'vue'
import '../../styles/varo.css'
import '../../styles/varo-agent.css'
import './agent-advanced.css'
import './agent-artifact.css'

export type { AgentArtifactItem, AgentAttachmentItem, AgentSourceItem } from './advanced-types'

const primaryButton = 'inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] px-3 text-xs font-bold text-[var(--varo-agent-primary-foreground)] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45'
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
    const confidenceLabel = computed(() => (
      confidence.value >= 80 ? '高置信度' : confidence.value >= 55 ? '中等置信度' : '需要复核'
    ))
    return () => h('section', { class: 'agent-recommendation grid gap-3 rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-4 shadow-[var(--varo-agent-shadow)]' }, [
      h('header', { class: 'flex justify-between gap-3 text-[11px] font-extrabold tracking-widest text-[var(--varo-agent-primary)]' }, [
        h('span', 'AGENT 建议'),
        h('span', { class: 'tabular-nums' }, `${confidenceLabel.value} · ${confidence.value}%`),
      ]),
      h('strong', { class: 'text-[15px] text-[var(--varo-agent-foreground)]' }, props.title),
      props.description ? h('p', { class: 'm-0 text-xs leading-5 text-[var(--varo-agent-text)]' }, props.description) : null,
      h('span', { 'class': 'h-1.5 overflow-hidden rounded-full bg-[var(--varo-agent-primary-soft)]', 'aria-hidden': 'true' }, [
        h('i', { class: 'block h-full rounded-full bg-[var(--varo-agent-primary)]', style: { width: `${confidence.value}%` } }),
      ]),
      slots.default?.(),
      h('footer', { class: 'flex justify-end gap-2' }, [slots.secondary?.(), h('button', { class: primaryButton, type: 'button', onClick: () => emit('accept') }, props.acceptText)]),
    ])
  },
})
export const AgentArtifact = defineComponent({
  name: 'AgentArtifact',
  props: { artifact: { type: Object as PropType<AgentArtifactItem>, required: true } },
  emits: { open: (_artifact: AgentArtifactItem) => true },
  setup(props, { emit }) {
    const kindLabel = computed(() => {
      if (props.artifact.kind === 'code') { return '代码产物' }
      if (props.artifact.kind === 'image') { return '图像产物' }
      if (props.artifact.kind === 'file') { return '文件产物' }
      return '文档产物'
    })
    return () =>
      h('article', { 'class': 'agent-artifact', 'data-kind': props.artifact.kind || 'document' }, [
        h('header', { class: 'agent-artifact__header' }, [
          h('span', { class: 'agent-artifact__heading' }, [
            h('small', { class: 'agent-artifact__kind' }, kindLabel.value),
            h('strong', { class: 'agent-artifact__title' }, props.artifact.title),
            props.artifact.language ? h('span', { class: 'agent-artifact__lang' }, props.artifact.language) : null,
          ]),
          h('button', {
            class: 'agent-artifact__open',
            type: 'button',
            onClick: () => emit('open', props.artifact),
          }, '打开'),
        ]),
        props.artifact.content
          ? h('pre', { class: 'agent-artifact__body' }, props.artifact.content)
          : null,
        props.artifact.previewUrl
          ? h('img', { alt: props.artifact.title, class: 'agent-artifact__preview', src: props.artifact.previewUrl })
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
      h('section', { class: 'grid gap-2.5 rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] p-3 shadow-sm' }, [
        h('header', { class: 'flex items-end justify-between gap-3 px-0.5' }, [
          h('span', { class: 'grid gap-0.5' }, [
            h('small', { class: 'text-[10px] font-black uppercase tracking-[0.16em] text-[var(--varo-agent-primary)]' }, 'Sources'),
            h('strong', { class: 'text-xs text-[var(--varo-agent-foreground)]' }, props.title),
          ]),
          h('small', { class: 'rounded-full bg-[var(--varo-agent-surface)] px-2 py-1 text-[10px] font-bold text-[var(--varo-agent-text)] ring-1 ring-slate-200' }, `${props.sources.length} refs`),
        ]),
        h(
          'div',
          { class: 'grid gap-2' },
          props.sources.map((source, index) =>
            h(
              'a',
              {
                class: 'group flex min-h-14 items-center gap-3 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 text-xs text-[var(--varo-agent-foreground)] shadow-sm transition-all hover:-translate-y-px hover:border-[var(--varo-agent-primary)] hover:shadow-md',
                href: source.url,
                key: source.id,
                rel: 'noreferrer noopener',
                target: '_blank',
                onClick: () => emit('open', source),
              },
              [
                h('span', { class: 'grid h-8 w-8 flex-none place-items-center rounded-xl bg-[var(--varo-agent-primary-soft)] text-[12px] font-black text-[var(--varo-agent-primary)]' }, String(index + 1).padStart(2, '0')),
                h('span', { class: 'grid min-w-0 flex-1 gap-0.5' }, [
                  h('strong', { class: 'truncate text-[12px] text-[var(--varo-agent-foreground)]' }, source.title),
                  h('small', { class: 'truncate text-[10px] text-[var(--varo-agent-muted)]' }, source.domain || source.description || source.url),
                ]),
                h('span', { 'aria-hidden': 'true', 'class': 'text-xs text-slate-300 transition-colors group-hover:text-[var(--varo-agent-primary)]' }, '↗'),
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
      h('section', { class: 'grid gap-2.5 rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] p-3 shadow-sm' }, [
        h('header', { class: 'flex items-end justify-between gap-3 px-0.5' }, [
          h('span', { class: 'grid gap-0.5' }, [
            h('small', { class: 'text-[10px] font-black uppercase tracking-[0.16em] text-[var(--varo-agent-primary)]' }, 'Files'),
            h('strong', { class: 'text-xs text-[var(--varo-agent-foreground)]' }, '附件'),
          ]),
          h('small', { class: 'text-[10px] font-bold text-[var(--varo-agent-muted)]' }, `${props.attachments.length} items`),
        ]),
        h(
          'div',
          { class: 'grid gap-2' },
          props.attachments.map(item =>
            h('article', { class: 'flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 shadow-sm', key: item.id }, [
              item.previewUrl
                ? h('img', { alt: '', class: 'h-9 w-9 flex-none rounded-xl object-cover', src: item.previewUrl })
                : h(
                    'i',
                    { class: 'grid h-9 w-9 flex-none place-items-center rounded-xl bg-slate-900 text-[10px] font-black not-italic text-white' },
                    item.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE',
                  ),
              h('span', { class: 'grid min-w-0 flex-1 gap-0.5' }, [
                h('strong', { class: 'truncate text-[12px] text-[var(--varo-agent-foreground)]' }, item.name),
                h('small', { class: 'text-[10px] text-[var(--varo-agent-muted)]' }, [item.size, item.mimeType].filter(Boolean).join(' · ')),
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
