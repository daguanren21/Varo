import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, posix, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
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

  it('rebases quoted and unquoted CSS URLs with whitespace and suffixes while preserving external URLs', async () => {
    const { root, write } = await fixture()
    await write('components/preview(1).svg', '<svg xmlns="http://www.w3.org/2000/svg" />')
    await write('components/markdown.wxss', `.assets {
      --double: url( "./preview(1).svg?size=2#shape" );
      --single: url( './preview.svg#single' );
      --bare: url( ./preview.svg?raw=1#bare );
      --remote: url("https://example.com/a(b).svg");
      --data: url("data:image/svg+xml,<svg>(x)</svg>");
    }`)
    await localizeNativeComponents(root)
    const styles = await readFile(resolve(root, 'a/components/markdown.wxss'), 'utf8')
    expect(styles).toContain('url("../../components/preview(1).svg?size=2#shape")')
    expect(styles).toContain('url(\'../../components/preview.svg#single\')')
    expect(styles).toContain('url(../../components/preview.svg?raw=1#bare)')
    expect(styles).toContain('url("https://example.com/a(b).svg")')
    expect(styles).toContain('url("data:image/svg+xml,<svg>(x)</svg>")')
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
    if (conflict === 'ancestor file') { await write('a/components', 'application-owned') }
    else if (conflict === 'destination directory') { await write('a/components/wrapper.js/keep', 'application-owned') }
    else { await write('a/components/markdown.js', 'module.exports = "application-owned"') }
    const before = await snapshot(root)
    await expect(localizeNativeComponents(root)).rejects.toThrow('Native component destination conflict:')
    expect(await snapshot(root)).toEqual(before)
  })
})
