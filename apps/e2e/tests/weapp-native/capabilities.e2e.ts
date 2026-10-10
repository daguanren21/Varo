import { expect } from 'e2e'
import { EngineError } from 'e2e/engine'
import { wechat } from '../../engines/wechat'
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
  expect((await miniProgram.route()).length).toBeGreaterThan(0)
})
