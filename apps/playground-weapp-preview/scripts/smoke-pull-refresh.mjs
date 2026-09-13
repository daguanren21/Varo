import assert from 'node:assert/strict'
import { chromium, expect } from '@playwright/test'

const baseUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4182/'
const runtimeUrl = new URL('runtime.html?scenario=controls&session=pull-refresh-smoke', baseUrl).toString()
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []

try {
  const page = await browser.newPage({ viewport: { width: 430, height: 844 } })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(runtimeUrl)
  await expect(page.getByText('PullRefresh 原生下拉刷新', { exact: true })).toBeVisible()
  const field = page.locator('[data-preview-field="pull-refresh-state"]')

  async function fire(type, clientY, pointerId = 1) {
    await page.evaluate(({ type, clientY, pointerId }) => {
      const pullRefresh = document.querySelector('.varo-pull-refresh')
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientY })
      Object.defineProperties(event, {
        pointerId: { value: pointerId },
        pointerType: { value: 'mouse' },
      })
      pullRefresh.dispatchEvent(event)
    }, { type, clientY, pointerId })
  }

  async function nativeState() {
    return page.evaluate(() => {
      const pullRefresh = document.querySelector('.varo-pull-refresh')
      return {
        distance: pullRefresh.dataset.nativeRefresherDistance,
        state: pullRefresh.dataset.nativeRefresherState,
      }
    })
  }

  await fire('pointerdown', 0, 1)
  await fire('pointermove', 160, 1)
  assert.deepEqual(await nativeState(), { distance: '80', state: 'ready' })
  await fire('pointercancel', 160, 1)
  assert.deepEqual(await nativeState(), { distance: '0', state: 'idle' })
  await expect(field).toHaveAttribute('data-preview-value', 'loading=false;count=0')

  await page.evaluate(() => {
    const pullRefresh = document.querySelector('.varo-pull-refresh')
    pullRefresh.scrollTop = 10
  })
  await fire('pointerdown', 0, 2)
  await fire('pointermove', 200, 2)
  await fire('pointerup', 200, 2)
  await expect(field).toHaveAttribute('data-preview-value', 'loading=false;count=0')
  await page.evaluate(() => {
    document.querySelector('.varo-pull-refresh').scrollTop = 0
  })

  await fire('pointerdown', 0, 3)
  await fire('pointermove', 80, 3)
  assert.deepEqual(await nativeState(), { distance: '40', state: 'pulling' })
  await fire('pointerup', 80, 3)
  await expect(field).toHaveAttribute('data-preview-value', 'loading=false;count=0')

  await fire('pointerdown', 0, 4)
  await fire('pointermove', 160, 4)
  assert.deepEqual(await nativeState(), { distance: '80', state: 'ready' })
  await fire('pointerup', 160, 4)
  await expect(field).toHaveAttribute('data-preview-value', 'loading=true;count=0')
  await fire('pointerdown', 0, 5)
  await fire('pointermove', 160, 5)
  await fire('pointerup', 160, 5)
  await expect(field).toHaveAttribute('data-preview-value', 'loading=false;count=1')

  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ runtimeUrl, checks: ['cancel', 'non-top', 'below-threshold', 'loading-gate', 'refresh-completion'] }))
}
finally {
  await browser.close()
}
