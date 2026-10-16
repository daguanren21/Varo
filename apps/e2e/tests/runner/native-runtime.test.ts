// @vitest-environment node
import type { HeadlessPage, HeadlessProgram } from '../../engines/wechat/driver'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { launchHeadless } from '../../engines/wechat/driver'

interface ComponentFixture { script: string, template: string }
const programs: { program: HeadlessProgram, root: string }[] = []

afterEach(async () => {
  for (const { program, root } of programs.splice(0)) {
    try { await program.close() }
    finally { await rm(root, { recursive: true, force: true }) }
  }
})

async function fixture(script: string, template: string, components: Record<string, ComponentFixture> = {}) {
  const root = await mkdtemp(join(tmpdir(), 'varo-native-runtime-'))
  const files: Record<string, string> = {
    'project.config.json': JSON.stringify({ miniprogramRoot: './' }),
    'app.json': JSON.stringify({ pages: ['pages/index'] }),
    'app.js': 'App({})',
    'pages/index.json': JSON.stringify({ usingComponents: Object.fromEntries(Object.keys(components).map(name => [name, `/components/${name}/index`])) }),
    'pages/index.js': script,
    'pages/index.wxml': template,
    'pages/index.wxss': '',
  }
  for (const [name, component] of Object.entries(components)) {
    files[`components/${name}/index.json`] = JSON.stringify({ component: true })
    files[`components/${name}/index.js`] = component.script
    files[`components/${name}/index.wxml`] = component.template
  }
  let program: HeadlessProgram
  try {
    await Promise.all(Object.entries(files).map(async ([name, content]) => {
      const path = join(root, name)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content)
    }))
    program = await launchHeadless(root)
  }
  catch (error) {
    await rm(root, { recursive: true, force: true })
    throw error
  }
  programs.push({ program, root })
  return await program.reLaunch('/pages/index')
}

async function node(page: HeadlessPage, xpath: string) {
  const matches = await page.getElementsByXpath(xpath)
  if (matches.length !== 1) { throw new Error(`Expected one native node for ${xpath}; received ${matches.length}`) }
  return matches[0]!
}

describe('native headless built-in behavior', () => {
  it('renders rich-text arrays and HTML literally, removes untrusted subtrees and reflects updates', async () => {
    const page = await fixture(`Page({
      data: {
        secret: 'not template content',
        nodes: [{ name: 'DIV', attrs: { id: 'rejected', class: 'safe', bindtap: 'escape' }, children: [
          { type: 'text', text: 'Hello &amp; <b>literal</b> {{secret}} ' },
          { name: 'b', children: [{ type: 'text', text: 'world' }] },
          { name: 'script', children: [{ type: 'text', text: 'untrusted' }] },
          { name: 'wxs', children: [{ type: 'text', text: 'throw new Error("executed")' }] }
        ] }]
      },
      replace() { this.setData({ nodes: '<p>A&nbsp;<b>B</b>&amp;amp;</p><script>untrusted</script><unknown>removed</unknown>' }) },
      clear() { this.setData({ nodes: [] }) }
    })`, '<view id="parent"><rich-text id="content" nodes="{{nodes}}" /></view>')
    const expected = 'Hello & <b>literal</b> {{secret}} world'
    expect(await (await node(page, '//*[@id="content"]')).text()).toBe(expected)
    expect((await page.snapshot()).root.text).toContain(expected)
    const richElement = await node(page, '//rich-text/div')
    expect(await richElement.attr('class')).toBe('safe')
    expect(await richElement.attr('id')).toBeUndefined()
    expect(await richElement.attr('bindtap')).toBeUndefined()
    await page.callMethodWithOptions('replace', { timeout: 1000 })
    expect(await (await node(page, '//*[@id="content"]')).text()).toBe('A\u00A0B&amp;')
    expect((await page.snapshot()).root.text).toContain('A\u00A0B&amp;')
    await page.callMethodWithOptions('clear', { timeout: 1000 })
    expect(await (await node(page, '//*[@id="parent"]')).text()).toBe('')
  })

  it('submits current named values once while retaining disabled, ordinary and outside-button behavior', async () => {
    const page = await fixture(`Page({
      data: { name: 'before', choices: [0, 2], region: ['Alpha,Beta', 'Gamma'], submissions: 0, taps: 0 },
      input(e) { this.setData({ name: e.detail.value }) },
      tap() { this.setData({ taps: this.data.taps + 1 }) },
      submit(e) { this.setData({ submissions: this.data.submissions + 1, values: e.detail.value, target: e.target.id, current: e.currentTarget.id }) }
    })`, `<view>
      <form id="form" bindsubmit="submit">
        <input id="name" name="name" value="{{name}}" bindinput="input" />
        <input name="empty" value="" /><input value="unnamed" />
        <switch name="off" checked="{{false}}" /><switch name="on" checked="{{true}}" />
        <slider name="zero" value="{{0}}" />
        <picker name="choices" mode="multiSelector" value="{{choices}}" />
        <picker name="region" mode="region" value="{{region}}" />
        <checkbox-group name="checks"><checkbox value="a" checked /><checkbox value="b" checked="{{false}}" /></checkbox-group>
        <radio-group name="radio"><radio value="a" /><radio value="b" checked /></radio-group>
        <button id="ordinary" bindtap="tap">Ordinary</button>
        <button id="disabled" form-type="submit" disabled bindtap="tap">Disabled</button>
        <button form-type="submit" catchtap="tap"><text id="submit-child">Submit</text></button>
      </form>
      <button id="outside" form-type="submit" bindtap="tap">Outside</button>
    </view>`)
    await (await node(page, '//*[@id="ordinary"]')).tap()
    await (await node(page, '//*[@id="disabled"]')).tap()
    await (await node(page, '//*[@id="outside"]')).tap()
    expect(await page.data('submissions')).toBe(0)
    expect(await page.data('taps')).toBe(2)
    const submit = await node(page, '//*[@id="submit-child"]')
    await (await node(page, '//*[@id="name"]')).input('after')
    await submit.tap()
    expect(await page.data('submissions')).toBe(1)
    expect(await page.data('taps')).toBe(3)
    expect(await page.data('values')).toEqual({ name: 'after', empty: '', off: false, on: true, zero: 0, choices: [0, 2], region: ['Alpha,Beta', 'Gamma'], checks: ['a'], radio: 'b' })
    expect(await page.data('target')).toBe('form')
    expect(await page.data('current')).toBe('form')
  })

  it('distinguishes bare Boolean attributes from nullish bindings and rechecks retained controls', async () => {
    const page = await fixture(`Page({
      data: { disabled: null, submissions: 0, taps: 0 },
      tap() { this.setData({ taps: this.data.taps + 1 }) },
      submit(e) { this.setData({ submissions: this.data.submissions + 1, values: e.detail.value }) },
      block() { this.setData({ disabled: true }) },
      unblock() { this.setData({ disabled: false }) }
    })`, `<form bindsubmit="submit">
      <switch name="nullish" checked="{{disabled}}" /><switch name="absent" checked="{{missing}}" />
      <switch name="bare" checked />
      <button id="submit" disabled="{{disabled}}" form-type="submit" bindtap="tap">Submit</button>
      <button id="absent" disabled="{{missing}}" bindtap="tap">Absent</button>
    </form>`)
    const submit = await node(page, '//*[@id="submit"]')
    await submit.tap()
    await (await node(page, '//*[@id="absent"]')).tap()
    expect(await page.data('submissions')).toBe(1)
    expect(await page.data('taps')).toBe(2)
    expect(await page.data('values')).toEqual({ nullish: false, absent: false, bare: true })
    await page.callMethodWithOptions('block', { timeout: 1000 })
    await submit.tap()
    expect(await page.data('submissions')).toBe(1)
    expect(await page.data('taps')).toBe(2)
    await page.callMethodWithOptions('unblock', { timeout: 1000 })
    await submit.tap()
    expect(await page.data('submissions')).toBe(2)
    expect(await page.data('taps')).toBe(3)
  })

  it('respects custom form button, field and group boundaries', async () => {
    const page = await fixture(`Page({
      data: { value: { accepted: false, index: 0 }, submissions: 0 },
      submit(e) { this.setData({ submissions: this.data.submissions + 1, values: e.detail.value }) },
      clear() { this.setData({ value: null }) }
    })`, `<form bindsubmit="submit">
      <custom-field name="custom" value="{{value}}" />
      <field-group /><private-fields />
      <plain-button /><form-button />
    </form>`, {
      'custom-field': { script: `Component({ behaviors: ['wx://form-field'], properties: { name: String, value: null } })`, template: '<view>Custom field</view>' },
      'field-group': { script: `Component({ behaviors: ['wx://form-field-group'] })`, template: '<view><input name="grouped" value="inside" /></view>' },
      'private-fields': { script: 'Component({})', template: '<view><input name="private" value="not submitted" /></view>' },
      'plain-button': { script: 'Component({ methods: { tap() {} } })', template: '<button id="plain-button" form-type="submit" bindtap="tap">Plain</button>' },
      'form-button': { script: `Component({ behaviors: ['wx://form-field-button'] })`, template: '<button id="form-button" form-type="submit">Submit</button>' },
    })
    await (await node(page, '//*[@id="plain-button"]')).tap()
    expect(await page.data('submissions')).toBe(0)
    await (await node(page, '//*[@id="form-button"]')).tap()
    expect(await page.data('submissions')).toBe(1)
    expect(await page.data('values')).toEqual({ custom: { accepted: false, index: 0 }, grouped: 'inside' })
    await page.callMethodWithOptions('clear', { timeout: 1000 })
    await (await node(page, '//*[@id="form-button"]')).tap()
    expect(await page.data('submissions')).toBe(2)
    expect(await page.data('values')).toEqual({ custom: null, grouped: 'inside' })
  })
})
