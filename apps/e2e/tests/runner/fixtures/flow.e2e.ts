import { existsSync, writeFileSync } from 'node:fs'
import { test } from '@e2e-dev/web'
import { expect } from 'e2e'

const scenario = process.env.VARO_GUARD_CASE

test('counter accepts a real user action', {
  retries: scenario === 'flaky' ? 1 : 0,
  skip: scenario === 'skip' ? 'Deliberately skipped required test' : false,
}, async ({ app, browser, screen }) => {
  await app.open('/')
  await screen.getByRole('button', { name: 'Increment', exact: true }).tap()
  if (scenario === 'cancel') {
    writeFileSync(process.env.VARO_GUARD_READY_FILE!, 'ready')
    await expect(screen.getByText('Never rendered', { exact: true })).toBeVisible()
  }
  const firstFlakyAttempt = scenario === 'flaky' && !existsSync(process.env.VARO_GUARD_RETRY_FILE!)
  if (firstFlakyAttempt) writeFileSync(process.env.VARO_GUARD_RETRY_FILE!, 'attempted')
  const value = await browser.evaluate(() => document.getElementById('count')?.textContent ?? null)
  expect(value).toBe(scenario === 'fail' || firstFlakyAttempt ? '2' : '1')
})

test('second required page is reachable', async ({ app, screen }) => {
  await app.open('/second')
  await expect(screen.getByRole('heading', { name: 'Second required page', exact: true })).toBeVisible()
})
