import { resolve } from 'node:path'
import { createMarkdownRenderer, disposeMdItInstance } from 'vitepress'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { renderSearchMarkdown } from './config'

const docsRoot = process.cwd()
const searchDocumentPath = resolve(docsRoot, 'search-test.md')

let markdown: Awaited<ReturnType<typeof createMarkdownRenderer>>

beforeAll(async () => {
  markdown = await createMarkdownRenderer(docsRoot, {
    languages: ['ts', 'vue'],
  })
})

afterAll(() => disposeMdItInstance())

async function renderSearch(source: string) {
  return renderSearchMarkdown(source, {
    cleanUrls: true,
    path: searchDocumentPath,
    relativePath: 'search-test.md',
  }, markdown)
}

describe('VitePress search rendering', () => {
  it('removes fenced code nested in blockquotes and ordered lists', async () => {
    const html = await renderSearch([
      '# Visible heading',
      '> Visible quote',
      '> ```ts',
      '> hiddenBlockquote()',
      '> ```',
      '1. Visible item',
      '   ~~~vue',
      '   <template>hiddenList</template>',
      '   ~~~',
      'Visible ending.',
    ].join('\n'))

    expect(html).toContain('Visible heading')
    expect(html).toContain('Visible quote')
    expect(html).toContain('Visible item')
    expect(html).toContain('Visible ending.')
    expect(html).not.toContain('hiddenBlockquote')
    expect(html).not.toContain('hiddenList')
  })

  it('expands included prose while omitting code from included Markdown', async () => {
    const html = await renderSearch('<!-- @include: ../../README.md -->')
    expect(html).toContain('Published packages')
    expect(html).toContain('The CLI does not overwrite existing files by default.')
    expect(html).not.toContain('pnpm dlx @varo-ui/cli')
  })

  it('leaves the normal page code renderer intact', async () => {
    const html = await markdown.renderAsync('```ts\nconst visibleNormalCode = true\n```', {
      cleanUrls: true,
      path: searchDocumentPath,
      relativePath: 'search-test.md',
    })
    expect(html).toContain('visibleNormalCode')
  })

  it('keeps invalid backtick-info openers searchable', async () => {
    const html = await renderSearch('Before\n```foo`bar\nAfter')
    expect(html).toContain('Before')
    expect(html).toContain('foo`bar')
    expect(html).toContain('After')
  })

  it('removes indented code blocks from search', async () => {
    const html = await renderSearch('Before\n\n    hiddenIndented()\n\nAfter')
    expect(html).toContain('Before')
    expect(html).toContain('After')
    expect(html).not.toContain('hiddenIndented')
  })

  it('preserves the documented search false frontmatter contract', async () => {
    const html = await renderSearch('---\nsearch: false\n---\n# Hidden page')
    expect(html).toBe('')
  })
})
