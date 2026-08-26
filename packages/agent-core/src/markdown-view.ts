import { isUnknownRecord } from './type-guards'
import type { ParsedNode } from 'stream-markdown-parser'

export type AgentMarkdownNodeKind =
  | 'admonition'
  | 'blockquote'
  | 'checkbox'
  | 'code-block'
  | 'definition'
  | 'definition-list'
  | 'emphasis'
  | 'footnote'
  | 'hardbreak'
  | 'heading'
  | 'highlight'
  | 'image'
  | 'inline-code'
  | 'insert'
  | 'link'
  | 'list'
  | 'list-item'
  | 'math-block'
  | 'math-inline'
  | 'paragraph'
  | 'strikethrough'
  | 'strong'
  | 'subscript'
  | 'superscript'
  | 'table'
  | 'table-cell'
  | 'table-row'
  | 'text'
  | 'thematic-break'

export interface AgentMarkdownViewNode {
  align?: 'center' | 'left' | 'right'
  alt?: string
  checked?: boolean
  children?: AgentMarkdownViewNode[]
  header?: boolean
  href?: string
  kind: AgentMarkdownNodeKind
  language?: string
  level?: number
  loading?: boolean
  ordered?: boolean
  start?: number
  text?: string
  title?: string
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : undefined
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function alignValue(value: unknown): 'center' | 'left' | 'right' | undefined {
  return value === 'center' || value === 'left' || value === 'right' ? value : undefined
}

function nodeField(node: ParsedNode, key: string): unknown {
  return key in node ? Reflect.get(node, key) : undefined
}

function normalizeUnknownNode(value: unknown): AgentMarkdownViewNode | undefined {
  if (!isUnknownRecord(value) || typeof value.type !== 'string' || typeof value.raw !== 'string') return undefined
  // The required BaseNode fields are validated above; extension fields stay runtime-checked.
  const node = value as ParsedNode
  return normalizeMarkdownNode(node)
}

function normalizeChildren(value: unknown): AgentMarkdownViewNode[] {
  if (!Array.isArray(value)) return []
  const result: AgentMarkdownViewNode[] = []
  value.forEach((item) => {
    const normalized = normalizeUnknownNode(item)
    if (normalized) result.push(normalized)
  })
  return result
}

function textNode(text: string): AgentMarkdownViewNode {
  return { kind: 'text', text }
}

export function normalizeMarkdownNode(node: ParsedNode): AgentMarkdownViewNode {
  const fallback = stringValue(node.raw)

  switch (node.type) {
    case 'text':
      return textNode(stringValue(node.content, fallback))
    case 'heading':
      return {
        children: normalizeChildren(node.children),
        kind: 'heading',
        level: numberValue(nodeField(node, 'level')) ?? 2,
        text: stringValue(nodeField(node, 'text'))
      }
    case 'paragraph':
    case 'inline':
      return { children: normalizeChildren(node.children), kind: 'paragraph' }
    case 'list':
      return {
        children: normalizeChildren(nodeField(node, 'items')),
        kind: 'list',
        ordered: booleanValue(nodeField(node, 'ordered')) ?? false,
        start: numberValue(nodeField(node, 'start'))
      }
    case 'list_item':
      return { children: normalizeChildren(node.children), kind: 'list-item' }
    case 'code_block':
      return {
        kind: 'code-block',
        language: stringValue(nodeField(node, 'language')),
        loading: booleanValue(node.loading),
        text: stringValue(node.code, fallback)
      }
    case 'inline_code':
      return { kind: 'inline-code', text: stringValue(node.code, fallback) }
    case 'link':
      return {
        children: normalizeChildren(node.children),
        href: stringValue(nodeField(node, 'href')),
        kind: 'link',
        text: stringValue(nodeField(node, 'text')),
        title: stringValue(nodeField(node, 'title'))
      }
    case 'image':
      return {
        alt: stringValue(nodeField(node, 'alt')),
        href: stringValue(nodeField(node, 'src')),
        kind: 'image',
        title: stringValue(nodeField(node, 'title'))
      }
    case 'thematic_break':
      return { kind: 'thematic-break' }
    case 'blockquote':
      return { children: normalizeChildren(node.children), kind: 'blockquote' }
    case 'table': {
      const header = nodeField(node, 'header')
      const rows = nodeField(node, 'rows')
      return {
        children: normalizeChildren(Array.isArray(rows) ? [header, ...rows] : [header]),
        kind: 'table'
      }
    }
    case 'table_row':
      return { children: normalizeChildren(nodeField(node, 'cells')), kind: 'table-row' }
    case 'table_cell':
      return {
        align: alignValue(nodeField(node, 'align')),
        children: normalizeChildren(node.children),
        header: booleanValue(nodeField(node, 'header')),
        kind: 'table-cell'
      }
    case 'strong':
      return { children: normalizeChildren(node.children), kind: 'strong' }
    case 'emphasis':
      return { children: normalizeChildren(node.children), kind: 'emphasis' }
    case 'strikethrough':
      return { children: normalizeChildren(node.children), kind: 'strikethrough' }
    case 'highlight':
      return { children: normalizeChildren(node.children), kind: 'highlight' }
    case 'insert':
      return { children: normalizeChildren(node.children), kind: 'insert' }
    case 'subscript':
      return { children: normalizeChildren(node.children), kind: 'subscript' }
    case 'superscript':
      return { children: normalizeChildren(node.children), kind: 'superscript' }
    case 'checkbox':
    case 'checkbox_input':
      return { checked: booleanValue(nodeField(node, 'checked')), kind: 'checkbox' }
    case 'emoji':
      return textNode(stringValue(nodeField(node, 'markup'), fallback))
    case 'definition_list':
      return { children: normalizeChildren(nodeField(node, 'items')), kind: 'definition-list' }
    case 'definition_item':
      return {
        children: [
          { children: normalizeChildren(nodeField(node, 'term')), header: true, kind: 'definition' },
          { children: normalizeChildren(nodeField(node, 'definition')), kind: 'definition' }
        ],
        kind: 'definition'
      }
    case 'footnote':
      return { children: normalizeChildren(node.children), kind: 'footnote', title: stringValue(nodeField(node, 'id')) }
    case 'footnote_reference':
    case 'reference':
      return { kind: 'footnote', text: stringValue(nodeField(node, 'id')) }
    case 'admonition':
      return {
        children: normalizeChildren(node.children),
        kind: 'admonition',
        text: stringValue(nodeField(node, 'kind')),
        title: stringValue(nodeField(node, 'title'))
      }
    case 'vmr_container':
      return {
        children: normalizeChildren(node.children),
        kind: 'admonition',
        loading: booleanValue(node.loading),
        title: stringValue(nodeField(node, 'name'))
      }
    case 'hardbreak':
      return { kind: 'hardbreak' }
    case 'math_inline':
      return { kind: 'math-inline', text: stringValue(node.content, fallback) }
    case 'math_block':
      return { kind: 'math-block', text: stringValue(node.content, fallback) }
    case 'html_block':
    case 'html_inline':
      return textNode(stringValue(node.content, fallback))
    default:
      return textNode(fallback)
  }
}

export function normalizeMarkdownNodes(nodes: ParsedNode[]): AgentMarkdownViewNode[] {
  return nodes.map(normalizeMarkdownNode)
}
