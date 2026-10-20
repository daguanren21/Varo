import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, posix, resolve } from 'node:path'
import { tokenize, TokenType } from '@csstools/css-tokenizer'
import { afterEach, describe, expect, it } from 'vitest'
import { postcss } from 'weapp-tailwindcss/core'
import { localizeNativeComponents } from '../scripts/localize-native-components.mjs'

const fixtures: string[] = []
afterEach(async () => { await Promise.all(fixtures.splice(0).map(path => rm(path, { recursive: true, force: true }))) })

async function fixture() {
  const root = await mkdtemp(resolve(tmpdir(), 'varo-native-packaging-'))
  fixtures.push(root)
  async function write(name: string, value: string | object) {
    const path = resolve(root, name)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, typeof value === 'string' ? value : JSON.stringify(value))
  }
  async function unit(name: string, json: object, js = 'module.exports = {}') {
    await write(`${name}.json`, json)
    await write(`${name}.js`, js)
    await write(`${name}.wxml`, '<view />')
    await write(`${name}.wxss`, '')
  }
  await write('app.json', { pages: ['pages/home'], subPackages: [{ root: 'a', pages: ['index'] }, { root: 'features/b', pages: ['index'] }] })
  await write('app.js', '')
  await unit('pages/home', { usingComponents: { button: '/components/button' } })
  await unit('a/index', { usingComponents: { wrapper: '/components/wrapper' } })
  await unit('features/b/index', { componentGenerics: { content: { default: '/components/markdown' } } })
  await unit('components/button', { component: true })
  await unit('components/wrapper', { component: true, usingComponents: { markdown: './markdown', button: './button' } })
  await unit('components/markdown', { component: true }, 'module.exports = require("./runtime.js")')
  await write('components/runtime.js', 'module.exports = { connected: new Set() }')
  await write('components/preview.svg', '<svg xmlns="http://www.w3.org/2000/svg" />')
  await write('components/format.wxs', 'module.exports = {}')
  await write('components/theme.wxss', '.content { color: red; }')
  await write('components/markdown.wxml', '<image src="./preview.svg" /><wxs module="format" src="./format.wxs" />')
  await write('components/markdown.wxss', '@import "./theme.wxss"; .content { background-image: url("./preview.svg"); }')
  const json = async (name: string) => JSON.parse(await readFile(resolve(root, `${name}.json`), 'utf8'))
  return { root, write, unit, json }
}

function target(owner: string, reference: string) {
  return posix.normalize(reference.startsWith('/') ? reference.slice(1) : posix.join(posix.dirname(owner), reference))
}

async function snapshot(root: string, directory = ''): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = posix.join(directory, entry.name)
    if (entry.isDirectory()) { Object.assign(result, await snapshot(root, path)) }
    else { result[path] = await readFile(resolve(root, path), 'utf8') }
  }
  return result
}

function cssValues(source: string) {
  return tokenize({ css: source }).flatMap(token => token[0] === TokenType.URL || token[0] === TokenType.String ? [token[4].value] : [])
}

const escapedAssets = [
  ['quoted space', '"./icons/a b.svg"', 'icons/a b.svg'],
  ['escaped space', String.raw`./icons/a\ b.svg`, 'icons/a b.svg'],
  ['quoted hexadecimal space', String.raw`"./icons/a\20 b.svg"`, 'icons/a b.svg'],
  ['hexadecimal space', String.raw`./icons/a\20 b.svg`, 'icons/a b.svg'],
  ['six-digit escape', String.raw`./icons/a\000020b.svg`, 'icons/a b.svg'],
  ['hexadecimal escape without terminator', String.raw`./icons/a\20z.svg`, 'icons/a z.svg'],
  ['CRLF escape terminator', './icons/a\\20\r\nb.svg', 'icons/a b.svg'],
  ['tab', String.raw`./icons/a\9 b.svg`, 'icons/a\tb.svg'],
  ['newline', String.raw`"./icons/a\a b.svg"`, 'icons/a\nb.svg'],
  ['string continuation', '"./icons/a\\\r\nb.svg"', 'icons/ab.svg'],
  ['punctuation', String.raw`./icons/a\,b\;c.svg`, 'icons/a,b;c.svg'],
  ['backslash', String.raw`./icons/a\\b.svg`, 'icons/a\\b.svg'],
  ['quotes', String.raw`./icons/a\"b\'c.svg`, 'icons/a"b\'c.svg'],
  ['quoted quote', String.raw`"./icons/a\"b.svg"`, 'icons/a"b.svg'],
  ['parentheses', String.raw`./icons/a\(b\).svg`, 'icons/a(b).svg'],
  ['trailing escaped space', String.raw`./icons/a.svg\ `, 'icons/a.svg '],
  ['leading escaped space', String.raw`./icons/\ a.svg`, 'icons/ a.svg'],
  ['non-BMP hexadecimal escape', String.raw`./icons/a\1f600.svg`, 'icons/a\u{1F600}.svg'],
] as const

const cssImports = [
  String.raw`"./styles/theme\20 name.wxss"`,
  String.raw`'./styles/theme\ name.wxss'`,
  String.raw`url(./styles/theme\20 name.wxss)`,
  String.raw`url( "./styles/theme\ name.wxss" )`,
  String.raw`URL('./styles/theme\20 name.wxss')`,
  String.raw`u\72l("./styles/theme\000020name.wxss")`,
] as const

describe('native production component packaging', () => {
  it('localizes shared components and their native parents while retaining main runtime identity and asset paths', async () => {
    const { root, json } = await fixture()
    await localizeNativeComponents(root)
    const wrapper = target('a/index', (await json('a/index')).usingComponents.wrapper)
    const markdownA = target(wrapper, (await json(wrapper)).usingComponents.markdown)
    const markdownB = target('features/b/index', (await json('features/b/index')).componentGenerics.content.default)
    expect(wrapper.startsWith('a/')).toBe(true)
    expect(markdownA.startsWith('a/')).toBe(true)
    expect(markdownB.startsWith('features/b/')).toBe(true)
    expect(target(wrapper, (await json(wrapper)).usingComponents.button)).toBe('components/button')
    await expect(readFile(resolve(root, 'components/markdown.js'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(readFile(resolve(root, 'components/wrapper.json'))).rejects.toMatchObject({ code: 'ENOENT' })
    const require = createRequire(resolve(root, 'probe.cjs'))
    const runtimeA = require(`./${markdownA}.js`)
    const runtimeB = require(`./${markdownB}.js`)
    runtimeA.connected.add('first-page')
    expect(runtimeB.connected.has('first-page')).toBe(true)
    expect(runtimeA).toBe(require('./components/runtime.js'))
    for (const component of [markdownA, markdownB]) {
      const wxml = await readFile(resolve(root, `${component}.wxml`), 'utf8')
      const sources = [...wxml.matchAll(/src="([^"]+)"/g)].map(match => target(component, match[1]))
      expect(sources).toEqual(['components/preview.svg', 'components/format.wxs'])
      const styles = await readFile(resolve(root, `${component}.wxss`), 'utf8')
      expect(target(component, styles.match(/@import "([^"]+)"/)![1])).toBe('components/theme.wxss')
      expect(target(component, styles.match(/url\("([^"]+)"\)/)![1])).toBe('components/preview.svg')
    }
    const packaged = await snapshot(root)
    await localizeNativeComponents(root)
    expect(await snapshot(root)).toEqual(packaged)
  })

  it.each(escapedAssets)('resolves %s to the same real asset from each relocated package', async (_name, url, path) => {
    const { root, write } = await fixture()
    await write(`components/${path}`, 'asset bytes')
    await write('components/markdown.wxss', `.asset { background: url(${url}); }`)
    await localizeNativeComponents(root)
    for (const component of ['a/components/markdown', 'features/b/components/markdown']) {
      const styles = postcss.parse(await readFile(resolve(root, `${component}.wxss`), 'utf8'))
      const references: string[] = []
      styles.walkDecls((declaration) => { references.push(...cssValues(declaration.value)) })
      expect(references).toHaveLength(1)
      const asset = target(component, references[0]!)
      expect(asset).toBe(`components/${path}`)
      expect(await readFile(resolve(root, asset), 'utf8')).toBe('asset bytes')
    }
    const packaged = await snapshot(root)
    await localizeNativeComponents(root)
    expect(await snapshot(root)).toEqual(packaged)
  })

  it('preserves URL suffixes, external and data URLs, and non-URL strings and comments', async () => {
    const { root, write } = await fixture()
    await write('components/a b(1).svg', 'asset bytes')
    const external = String.raw`u\72l("https\3a //example.com/a(b).svg")`
    const data = String.raw`url('data:image/svg+xml,<svg>(x)</svg>')`
    const protocolRelative = 'url(//example.com/preview.svg)'
    const fragment = String.raw`url(\23 shape)`
    const source = `.assets {
      --asset: url( ${String.raw`./a\20 b\(1\).svg\3f size=2\23 shape`} );
      --absolute: URL(${String.raw`"/components/a\20 b(1).svg?size=2#shape"`});
      --remote: ${external};
      --data: ${data};
      --protocol-relative: ${protocolRelative};
      --fragment: ${fragment};
      content: "url(./missing.svg)";
      /* url(./missing-comment.svg) */
    }`
    await write('components/markdown.wxss', source)
    await localizeNativeComponents(root)
    const styles = await readFile(resolve(root, 'a/components/markdown.wxss'), 'utf8')
    const declarations = new Map<string, string>()
    postcss.parse(styles).walkDecls((declaration) => { declarations.set(declaration.prop, declaration.value) })
    for (const property of ['--asset', '--absolute']) {
      const [value] = cssValues(declarations.get(property)!)
      expect(value!.slice(value!.indexOf('?'))).toBe('?size=2#shape')
      const asset = target('a/components/markdown', value!.split('?')[0]!)
      expect(await readFile(resolve(root, asset), 'utf8')).toBe('asset bytes')
    }
    expect(declarations.get('--remote')).toBe(external)
    expect(declarations.get('--data')).toBe(data)
    expect(declarations.get('--protocol-relative')).toBe(protocolRelative)
    expect(declarations.get('--fragment')).toBe(fragment)
    expect(declarations.get('content')).toBe('"url(./missing.svg)"')
    expect(styles).toContain('/* url(./missing-comment.svg) */')
  })

  it.each(cssImports)('relocates a CSS import %s and preserves its dependency closure and conditions', async (reference) => {
    const { root, write } = await fixture()
    await write('components/styles/theme name.wxss', String.raw`.asset { background: url(../icons/a\20 b.svg); }`)
    await write('components/icons/a b.svg', 'asset bytes')
    await write('components/markdown.wxss', `@import ${reference} layer(theme) screen and (min-width: 1px);`)
    await localizeNativeComponents(root)
    for (const component of ['a/components/markdown', 'features/b/components/markdown']) {
      const styles = postcss.parse(await readFile(resolve(root, `${component}.wxss`), 'utf8'))
      const references: string[] = []
      styles.walkAtRules('import', (rule) => {
        expect(rule.params).toContain('layer(theme) screen and (min-width: 1px)')
        references.push(...cssValues(rule.params))
      })
      expect(references).toHaveLength(1)
      const imported = target(component, references[0]!)
      expect(imported).toBe('components/styles/theme name.wxss')
      const importedStyles = postcss.parse(await readFile(resolve(root, imported), 'utf8'))
      let asset = ''
      importedStyles.walkDecls((declaration) => { asset = target(imported, cssValues(declaration.value)[0]!) })
      expect(await readFile(resolve(root, asset), 'utf8')).toBe('asset bytes')
    }
  })

  it.each(cssImports)('rejects a missing imported stylesheet %s before writing', async (reference) => {
    const { root, write } = await fixture()
    await write('components/markdown.wxss', `@import ${reference};`)
    const before = await snapshot(root)
    await expect(localizeNativeComponents(root)).rejects.toThrow('Missing native artifact: components/styles/theme name.wxss')
    expect(await snapshot(root)).toEqual(before)
  })

  it.each(escapedAssets)('rejects a missing %s asset before writing', async (_name, url, path) => {
    const { root, write } = await fixture()
    await write('components/markdown.wxss', `.asset { background: url(${url}); }`)
    const before = await snapshot(root)
    await expect(localizeNativeComponents(root)).rejects.toThrow(`Missing native artifact: components/${path}`)
    expect(await snapshot(root)).toEqual(before)
  })

  it.each(cssImports)('keeps a main stylesheet dependency reached through %s in main', async (reference) => {
    const { root, write, unit, json } = await fixture()
    await unit('components/styles/theme name', { component: true })
    await write('app.wxss', `@import ${reference.replace('./styles/', './components/styles/')};`)
    await write('a/index.json', { usingComponents: { ...(await json('a/index')).usingComponents, theme: '/components/styles/theme name' } })
    await localizeNativeComponents(root)
    expect(target('a/index', (await json('a/index')).usingComponents.theme)).toBe('components/styles/theme name')
    expect(await readFile(resolve(root, 'components/styles/theme name.wxss'), 'utf8')).toBe('')
  })

  it.each(['native parent', 'main script', 'main style', 'shared template', 'transitive script'])('retains components reached by a %s in main', async (consumer) => {
    const { root, write, json } = await fixture()
    if (consumer === 'native parent') {
      await write('pages/home.json', { usingComponents: { wrapper: '/components/wrapper' } })
    }
    else if (consumer === 'main style') { await write('app.wxss', '@import "./components/markdown.wxss";') }
    else if (consumer === 'shared template') {
      await write('pages/home.wxml', '<include src="../shared.wxml" />')
      await write('shared.wxml', '<include src="./components/markdown.wxml" />')
    }
    else if (consumer === 'transitive script') {
      await write('main-loader.js', 'module.exports = require("./shared.js")')
      await write('shared.js', 'module.exports = require("./components/markdown.js")')
    }
    else { await write('main-loader.js', 'module.exports = require("./components/markdown.js")') }
    await localizeNativeComponents(root)
    expect(target('features/b/index', (await json('features/b/index')).componentGenerics.content.default)).toBe('components/markdown')
    const require = createRequire(resolve(root, 'probe.cjs'))
    expect(require('./components/markdown.js')).toBe(require('./components/runtime.js'))
  })

  it.each(['file', 'ancestor file', 'destination directory'])('rejects %s conflicts before modifying any compiler output', async (conflict) => {
    const { root, write } = await fixture()
    await write('components/a b.svg', 'asset bytes')
    await write('components/markdown.wxss', String.raw`.asset { background: url(./a\20 b.svg); }`)
    if (conflict === 'ancestor file') { await write('a/components', 'application-owned') }
    else if (conflict === 'destination directory') { await write('a/components/wrapper.js/keep', 'application-owned') }
    else { await write('a/components/markdown.js', 'module.exports = "application-owned"') }
    const before = await snapshot(root)
    await expect(localizeNativeComponents(root)).rejects.toThrow('Native component destination conflict:')
    expect(await snapshot(root)).toEqual(before)
  })
})
