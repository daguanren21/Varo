import {
  createStreamingMarkdownParser,
  normalizeMarkdownNodes,
  type AgentMarkdownViewNode
} from '@varo/agent-core'
import { defineComponent, h, shallowRef, watch, type PropType, type VNodeChild } from 'vue'
import { cn, type ClassValue } from '../../lib/cn'
import './agent-markdown.css'

function renderChildren(node: AgentMarkdownViewNode, onLink: (href: string) => void): VNodeChild[] {
  return (node.children ?? []).map((child) => renderNode(child, onLink))
}

function renderNode(node: AgentMarkdownViewNode, onLink: (href: string) => void): VNodeChild {
  const children = () => renderChildren(node, onLink)

  switch (node.kind) {
    case 'text':
      return node.text ?? ''
    case 'heading': {
      const level = Math.min(6, Math.max(1, node.level ?? 2))
      return h(`h${level}`, { class: `agent-markdown__h agent-markdown__h${level}` }, children())
    }
    case 'paragraph':
      return h('p', { class: 'agent-markdown__paragraph' }, children())
    case 'list':
      return h(
        node.ordered ? 'ol' : 'ul',
        {
          class: ['agent-markdown__list', node.ordered ? 'agent-markdown__list--ordered' : 'agent-markdown__list--bullet'],
          start: node.ordered ? node.start : undefined
        },
        children()
      )
    case 'list-item':
      return h('li', { class: 'agent-markdown__list-item' }, children())
    case 'code-block':
      return h('figure', { class: 'agent-markdown__code-block', 'data-loading': String(Boolean(node.loading)) }, [
        h('figcaption', { class: 'agent-markdown__code-head' }, node.language || 'text'),
        h('pre', { class: 'agent-markdown__pre' }, [h('code', node.text ?? '')])
      ])
    case 'inline-code':
      return h('code', { class: 'agent-markdown__inline-code' }, node.text ?? '')
    case 'link': {
      const linkChildren = children()
      return h(
        'a',
        {
          class: 'agent-markdown__link',
          href: node.href,
          rel: 'noreferrer noopener',
          target: '_blank',
          title: node.title,
          onClick: () => node.href && onLink(node.href)
        },
        linkChildren.length > 0 ? linkChildren : node.text
      )
    }
    case 'image':
      return h('img', {
        alt: node.alt,
        class: 'agent-markdown__image',
        loading: 'lazy',
        src: node.href,
        title: node.title
      })
    case 'thematic-break':
      return h('hr', { class: 'agent-markdown__rule' })
    case 'blockquote':
      return h('blockquote', { class: 'agent-markdown__quote' }, children())
    case 'table':
      return h('div', { class: 'agent-markdown__table-scroll' }, [h('table', { class: 'agent-markdown__table' }, children())])
    case 'table-row':
      return h('tr', children())
    case 'table-cell':
      return h(node.header ? 'th' : 'td', { style: { textAlign: node.align } }, children())
    case 'strong':
      return h('strong', { class: 'agent-markdown__strong' }, children())
    case 'emphasis':
      return h('em', children())
    case 'strikethrough':
      return h('del', children())
    case 'highlight':
      return h('mark', { class: 'agent-markdown__mark' }, children())
    case 'insert':
      return h('ins', children())
    case 'subscript':
      return h('sub', children())
    case 'superscript':
      return h('sup', children())
    case 'checkbox':
      return h('input', { checked: node.checked, disabled: true, type: 'checkbox' })
    case 'definition-list':
      return h('dl', { class: 'agent-markdown__definitions' }, children())
    case 'definition':
      return h(node.header ? 'dt' : 'dd', children())
    case 'footnote':
      return h('sup', { class: 'agent-markdown__footnote', title: node.title }, node.text || children())
    case 'admonition':
      return h('aside', { class: 'agent-markdown__admonition', 'data-kind': node.text || 'note' }, [
        node.title ? h('strong', { class: 'agent-markdown__admonition-title' }, node.title) : null,
        ...children()
      ])
    case 'hardbreak':
      return h('br')
    case 'math-inline':
      return h('code', { class: 'agent-markdown__math-inline' }, node.text ?? '')
    case 'math-block':
      return h('pre', { class: 'agent-markdown__math-block' }, node.text ?? '')
  }
}

export const AgentMarkdown = defineComponent({
  name: 'AgentMarkdown',
  props: {
    className: { type: [String, Array, Object] as PropType<ClassValue>, default: undefined },
    content: { type: String, default: '' },
    customHtmlTags: { type: Array as PropType<string[]>, default: () => [] },
    final: Boolean
  },
  emits: {
    link: (_href: string) => true
  },
  setup(props, { emit }) {
    const parser = createStreamingMarkdownParser({ customHtmlTags: props.customHtmlTags })
    const nodes = shallowRef<AgentMarkdownViewNode[]>([])
    let previousContent = ''

    watch(
      [() => props.content, () => props.final],
      ([content, final]) => {
        if (!content.startsWith(previousContent)) parser.reset()
        previousContent = content
        nodes.value = normalizeMarkdownNodes(parser.parse(content, { final }))
      },
      { immediate: true }
    )

    return () =>
      h(
        'div',
        {
          class: cn('agent-markdown break-words text-sm leading-7', props.className),
          'data-final': String(props.final)
        },
        nodes.value.map((node) => renderNode(node, (href) => emit('link', href)))
      )
  }
})
