import {
  getMarkdown,
  isUnsafeHtmlUrl,
  parseMarkdownToStructure,
  type GetMarkdownOptions,
  type ParsedNode
} from 'stream-markdown-parser'

export interface StreamingMarkdownParserOptions {
  customHtmlTags?: readonly string[]
  enableMath?: boolean
  includeSourceMap?: boolean
  markdownItOptions?: GetMarkdownOptions['markdownItOptions']
  validateLink?: (url: string) => boolean
}

export interface StreamingMarkdownParser {
  parse: (content: string, options?: { final?: boolean }) => ParsedNode[]
  reset: () => void
}

let parserId = 0

export function createStreamingMarkdownParser(
  options: StreamingMarkdownParserOptions = {}
): StreamingMarkdownParser {
  parserId += 1
  const validateLink = options.validateLink ?? ((url: string) => !isUnsafeHtmlUrl(url))
  const markdown = getMarkdown(`varo-agent-${parserId}`, {
    customHtmlTags: options.customHtmlTags,
    enableMath: options.enableMath ?? true,
    markdownItOptions: {
      breaks: true,
      html: false,
      linkify: true,
      ...options.markdownItOptions,
      validateLink
    }
  })

  return {
    parse(content, parseOptions = {}) {
      return parseMarkdownToStructure(content, markdown, {
        customHtmlTags: options.customHtmlTags,
        final: parseOptions.final ?? false,
        includeSourceMap: options.includeSourceMap ?? false,
        reuseStableTopLevelNodes: true,
        streamParse: 'auto',
        validateLink
      })
    },
    reset() {
      markdown.stream?.reset?.()
    }
  }
}

export type { ParsedNode } from 'stream-markdown-parser'
