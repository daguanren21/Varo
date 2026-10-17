// @vitest-environment node
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { expect, it } from 'vitest'

it('initializes and decodes streaming entities without browser or Node globals', () => {
  const entry = new URL('../src/markdown.ts', import.meta.url).href
  // Static imports run before the host globals can be removed, missing trie initialization.
  const result = execFileSync(process.execPath, ['--input-type=module', '-e', `
    delete globalThis.atob
    delete globalThis.btoa
    delete globalThis.Buffer
    const { createStreamingMarkdownParser } = await import(${JSON.stringify(entry)})
    const parser = createStreamingMarkdownParser()
    parser.parse('A &am', { final: false })
    const nodes = parser.parse('A &amp; B &NotEqualTilde;', { final: true })
    console.log(JSON.stringify({
      text: nodes[0].children.map(node => node.content).join(''),
      atob: 'atob' in globalThis,
      btoa: 'btoa' in globalThis,
      buffer: 'Buffer' in globalThis,
    }))
  `], { encoding: 'utf8' })
  expect(JSON.parse(result)).toEqual({ text: 'A & B ≂̸', atob: false, btoa: false, buffer: false })
})

it('renders Unicode fenced code inside HTML details without browser base64 globals', () => {
  const entry = new URL('../src/markdown.ts', import.meta.url).href
  const content = '<details>\n<summary>Example</summary>\n\n```ts\nconst text = "你好"\n```\n\n</details>'
  // A fresh process also verifies that HTML rendering does not install a global encoder.
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
    delete globalThis.atob
    delete globalThis.btoa
    delete globalThis.Buffer
    const { createStreamingMarkdownParser } = await import(${JSON.stringify(entry)})
    const parser = createStreamingMarkdownParser({ markdownItOptions: { html: true } })
    console.log(JSON.stringify({
      node: parser.parse(${JSON.stringify(content)}, { final: true })[0],
      btoa: 'btoa' in globalThis,
    }))
  `], { encoding: 'utf8' })
  const result = JSON.parse(output)
  expect(result.node).toMatchObject({ type: 'html_block', tag: 'details', loading: false })
  const encoded = /data-code="([^"]+)"/.exec(result.node.content)?.[1]
  expect(encoded).toBeDefined()
  expect(Buffer.from(encoded!, 'base64').toString('utf8')).toBe('const text = "你好"\n')
  expect(result.btoa).toBe(false)
})
