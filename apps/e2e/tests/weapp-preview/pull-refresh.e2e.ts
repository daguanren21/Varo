import { expect } from 'e2e'
import { test } from '../../engines/web'
import { field } from './support'

test('preview pull-refresh cancel, scroll gate, threshold and loading lifecycle', { platforms: ['weapp-preview'] }, async ({ app, browser, screen, webRuntime }) => {
  await browser.setViewport({ width: 430, height: 844 })
  await app.open('/runtime.html?scenario=controls&session=pull-refresh-smoke')
  await expect(screen.getByText('PullRefresh 原生下拉刷新', { exact: true })).toBeVisible()
  const state = field(browser, 'pull-refresh-state')

  // Preserve the original browser-preview pointer protocol, not native setData.
  async function fire(type: string, clientY: number, pointerId: number) {
    await browser.evaluate(({ type, clientY, pointerId }) => {
      const pullRefresh = document.querySelector('.varo-pull-refresh')!
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientY })
      Object.defineProperties(event, {
        pointerId: { value: pointerId },
        pointerType: { value: 'mouse' },
      })
      pullRefresh.dispatchEvent(event)
      return null
    }, { type, clientY, pointerId })
  }

  async function nativeState() {
    return browser.evaluate(() => {
      const pullRefresh = document.querySelector('.varo-pull-refresh')!
      return {
        distance: pullRefresh.getAttribute('data-native-refresher-distance'),
        state: pullRefresh.getAttribute('data-native-refresher-state'),
      }
    })
  }

  await fire('pointerdown', 0, 1)
  await fire('pointermove', 160, 1)
  expect(await nativeState()).toEqual({ distance: '80', state: 'ready' })
  await fire('pointercancel', 160, 1)
  expect(await nativeState()).toEqual({ distance: '0', state: 'idle' })
  await expect(state).toHaveAttribute('data-preview-value', 'loading=false;count=0')

  await browser.evaluate(() => {
    document.querySelector('.varo-pull-refresh')!.scrollTop = 10
    return null
  })
  await fire('pointerdown', 0, 2)
  await fire('pointermove', 200, 2)
  await fire('pointerup', 200, 2)
  await expect(state).toHaveAttribute('data-preview-value', 'loading=false;count=0')
  await browser.evaluate(() => {
    document.querySelector('.varo-pull-refresh')!.scrollTop = 0
    return null
  })

  await fire('pointerdown', 0, 3)
  await fire('pointermove', 80, 3)
  expect(await nativeState()).toEqual({ distance: '40', state: 'pulling' })
  await fire('pointerup', 80, 3)
  await expect(state).toHaveAttribute('data-preview-value', 'loading=false;count=0')

  await fire('pointerdown', 0, 4)
  await fire('pointermove', 160, 4)
  expect(await nativeState()).toEqual({ distance: '80', state: 'ready' })
  await fire('pointerup', 160, 4)
  await expect(state).toHaveAttribute('data-preview-value', 'loading=true;count=0')
  await fire('pointerdown', 0, 5)
  await fire('pointermove', 160, 5)
  await fire('pointerup', 160, 5)
  await expect(state).toHaveAttribute('data-preview-value', 'loading=false;count=1')
  expect((await webRuntime.diagnostics()).pageErrors).toEqual([])
})
