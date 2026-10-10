import { expect } from 'e2e'
import { test } from '../../engines/web'

test('H5 installed ProductList delivers distinct select and cart intents to its consumer', { platforms: ['h5'] }, async ({ app, browser, screen, webRuntime }) => {
  await browser.setViewport({ width: 1280, height: 900 })
  await app.open('/')
  await expect(screen.getByRole('heading', { name: 'H5 Registry QA Playground', exact: true })).toBeVisible()
  const events = browser.locator('.pg__event')
  await expect(events).toHaveText('等待交互')

  // App.vue owns these events; use the installed Block's actual controls.
  await screen.getByRole('button', { name: '查看 帆布通勤包', exact: true }).last().click()
  await expect(events).toHaveText('查看商品：帆布通勤包')
  await screen.getByRole('button', { name: '将 帆布通勤包 加入购物车', exact: true }).click()
  await expect(events).toHaveText('加入购物车：帆布通勤包')
  await screen.getByRole('button', { name: '将 棉质圆领上衣 加入购物车', exact: true }).focus()
  await browser.keyboard.press('Enter')
  await expect(events).toHaveText('加入购物车：棉质圆领上衣')
  await screen.getByRole('button', { name: '查看 棉质圆领上衣', exact: true }).last().click()
  await expect(events).toHaveText('查看商品：棉质圆领上衣')
  expect((await webRuntime.diagnostics()).pageErrors).toEqual([])
  await app.screenshot('h5-product-list-consumer')
})
