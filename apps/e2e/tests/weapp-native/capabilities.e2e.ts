import type { OperationContext } from 'e2e/engine'
import type { HeadlessProgram } from '../../engines/wechat/driver'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect } from 'e2e'
import { EngineError } from 'e2e/engine'
import { wechat } from '../../engines/wechat'
import { launchHeadless } from '../../engines/wechat/driver'
import { NativeSemantics } from '../../engines/wechat/semantics'
import { test } from './fixtures'

test('native capabilities reject unavailable keyboard and screenshot paths', { platforms: ['weapp-headless'] }, async ({ miniProgram }) => {
  const engine = wechat({ mode: 'headless' })
  expect(engine.platform).toBe('weapp-headless')
  expect(engine.capabilities.has('observation')).toBe(true)
  expect(engine.capabilities.has('location')).toBe(true)
  expect(engine.capabilities.has('miniProgram')).toBe(true)
  expect(engine.capabilities.has('keyboard')).toBe(false)
  expect(engine.capabilities.has('artifacts')).toBe(false)
  expect(engine.keyboard).toBeUndefined()
  expect(engine.artifacts).toBeUndefined()
  expect(engine.actions).toEqual(['tap', 'fill', 'clear'])
  if (!engine.perform) { throw new Error('Native engine must expose its declared actions') }
  let rejected: unknown
  try {
    await engine.perform({ id: 'unavailable', revision: '' }, { kind: 'press', key: 'Enter' }, {
      signal: new AbortController().signal,
      timeoutMs: 1000,
      runId: 'capability-contract',
      attemptId: 'capability-contract',
      origin: 'test',
    })
  }
  catch (error) { rejected = error }
  expect(rejected instanceof EngineError).toBe(true)
  if (!(rejected instanceof EngineError)) { throw new Error('Expected an EngineError') }
  expect(rejected.code).toBe('UNSUPPORTED_CAPABILITY')
  expect(rejected.retryable).toBe(false)
  // A real headless session is running for this test; its fixture never offers
  // fake pixel evidence as a substitute for the absent artifacts capability.
  expect(miniProgram.mode).toBe('headless')
})

test('native Boolean guards preserve absent and false state and reject disabled or hidden actions', { platforms: ['weapp-headless'] }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'varo-native-boolean-'))
  let program: HeadlessProgram | undefined
  try {
    const fixture = join(root, 'pages/boolean-contract')
    await mkdir(fixture, { recursive: true })
    await Promise.all([
      writeFile(join(root, 'project.config.json'), JSON.stringify({ miniprogramRoot: './' })),
      writeFile(join(root, 'app.json'), JSON.stringify({ pages: ['pages/boolean-contract/index'] })),
      writeFile(join(root, 'app.js'), 'App({})'),
      writeFile(join(fixture, 'index.json'), '{}'),
      writeFile(join(fixture, 'index.wxss'), ''),
      writeFile(join(fixture, 'index.js'), `Page({
        data: { taps: 0 },
        tap() { this.setData({ taps: this.data.taps + 1 }) }
      })`),
      writeFile(join(fixture, 'index.wxml'), `<view>
        <button id="absent" bindtap="tap">Absent</button>
        <button id="false" disabled="{{false}}" hidden="{{false}}" aria-disabled="false" bindtap="tap">False</button>
        <button id="bare-disabled" disabled bindtap="tap">Bare disabled</button>
        <button id="true-disabled" disabled="{{true}}" bindtap="tap">True disabled</button>
        <button id="bare-hidden" hidden bindtap="tap">Bare hidden</button>
        <button id="true-hidden" hidden="{{true}}" bindtap="tap">True hidden</button>
        <button id="aria-disabled" disabled="{{false}}" aria-disabled="true" bindtap="tap">ARIA disabled</button>
        <button id="aria-hidden" hidden="{{false}}" aria-hidden="true" bindtap="tap">ARIA hidden</button>
        <view hidden><button id="ancestor-hidden" bindtap="tap">Hidden ancestor</button></view>
        <input id="bare-password" password value="secret" />
        <input id="true-password" password="{{true}}" value="secret" />
        <input id="false-password" password="{{false}}" value="visible" />
        <input id="absent-password" value="visible" />
        <checkbox id="bare-checked" checked />
        <checkbox id="true-checked" checked="{{true}}" />
        <checkbox id="false-checked" checked="{{false}}" />
        <checkbox id="absent-checked" />
      </view>`),
    ])
    const native = await launchHeadless(root)
    program = native
    const page = await native.reLaunch('/pages/boolean-contract/index')
    const semantics = new NativeSemantics()
    const context: OperationContext = {
      signal: new AbortController().signal,
      timeoutMs: 1000,
      runId: 'native-boolean-contract',
      attemptId: 'native-boolean-contract',
      origin: 'test',
    }
    async function one(xpath: string) {
      const nodes = await semantics.locate(native, { kind: 'selector', selector: xpath }, context)
      expect(nodes.length).toBe(1)
      return nodes[0]!
    }
    async function tap(xpath: string) {
      const node = await one(xpath)
      const live = await semantics.live(native, node.ref.id, context)
      await live.node.tap()
    }
    async function rejectedTap(xpath: string) {
      let error: unknown
      try { await tap(xpath) }
      catch (caught) { error = caught }
      expect(error instanceof EngineError).toBe(true)
      if (!(error instanceof EngineError)) { throw new Error(`Expected native rejection for ${xpath}`) }
      expect(error.code).toBe('NOT_ACTIONABLE')
      expect(error.retryable).toBe(false)
    }
    await tap('//*[@id="absent"]')
    await tap('//*[@id="false"]')
    expect(await page.data('taps')).toBe(2)
    for (const id of ['bare-disabled', 'true-disabled', 'bare-hidden', 'true-hidden', 'aria-disabled', 'ancestor-hidden']) {
      await rejectedTap(`//*[@id="${id}"]`)
      expect(await page.data('taps')).toBe(2)
    }
    const accessibleButtons = await semantics.locate(native, {
      kind: 'query',
      query: { kind: 'role', value: { kind: 'string', value: 'button', exact: true } },
    }, context)
    expect(accessibleButtons.map(node => node.attributes?.id)).toContain('absent')
    expect(accessibleButtons.some(node => node.attributes?.id === 'aria-hidden')).toBe(false)
    expect((await one('//*[@id="aria-hidden"]')).states?.hidden).toBe(false)
    await tap('//*[@id="aria-hidden"]')
    expect(await page.data('taps')).toBe(3)
    for (const prefix of ['bare', 'true']) {
      const field = await one(`//*[@id="${prefix}-password"]`)
      expect(field.states?.secure).toBe(true)
      expect(field.value).toBeUndefined()
      expect(field.attributes?.value).toBeUndefined()
      expect((await one(`//*[@id="${prefix}-checked"]`)).states?.checked).toBe(true)
    }
    for (const prefix of ['false', 'absent']) {
      const field = await one(`//*[@id="${prefix}-password"]`)
      expect(field.states?.secure).toBe(false)
      expect(field.value).toBe('visible')
    }
    expect((await one('//*[@id="false-checked"]')).states?.checked).toBe(false)
    expect((await one('//*[@id="absent-checked"]')).states?.checked).toBeUndefined()
  }
  finally {
    try { await program?.close() }
    finally { await rm(root, { recursive: true, force: true }) }
  }
})
