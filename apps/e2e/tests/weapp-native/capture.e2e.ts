import { expect } from 'e2e'
import { blockEntries, classXPath, dataRecord, expectRoute, showBlock, test } from './fixtures'

test.describe('native screenshot entries', { platforms: ['weapp-devtools'], requires: ['miniProgram', 'artifacts'] }, () => {
  test.afterEach(async ({ miniProgram }) => { expect(await miniProgram.errors()).toEqual([]) })

  for (const block of blockEntries) {
    test(`capture Block ${block}`, async ({ miniProgram }) => {
      await showBlock(miniProgram, block)
      const viewport = await miniProgram.windowInfo()
      expect(viewport.windowWidth).toBe(375)
      const root = '(//view[contains(@class,"min-h-screen")])[1]'
      const minHeight = await miniProgram.style(root, 'min-height')
      expect(minHeight).toMatch(/^\d+(?:\.\d+)?px$/)
      const box = await miniProgram.geometry(root)
      expect(box.width).toBe(375)
      const renderedHeight = Number.parseFloat(minHeight)
      expect(renderedHeight).toBeGreaterThan(0)
      expect(renderedHeight).toBeLessThanOrEqual(Number(viewport.screenHeight))
      const top = Number(viewport.screenHeight) - renderedHeight
      const bottomInset = viewport.safeArea ? Number(viewport.screenHeight) - Number(dataRecord(viewport.safeArea).bottom) : 0
      const contentHeight = renderedHeight - bottomInset
      expect(top).toBeGreaterThanOrEqual(0)
      expect(contentHeight).toBeGreaterThan(0)
      expect(top + contentHeight).toBeLessThanOrEqual(Number(viewport.screenHeight))
      // Original full native PNG is attached to this attempt, never written to authored docs.
      expect(await miniProgram.screenshot(`block-${block}`)).toMatch(/\.png$/)
    })
  }

  for (const state of ['closed', 'open', 'streaming'] as const) {
    test(`capture mall Agent ${state}`, async ({ miniProgram, screen }) => {
      await miniProgram.reLaunch('/pages/mall/index')
      await expectRoute(miniProgram, '/pages/mall/index')
      if (state !== 'closed') {
        await screen.getByRole('button', { name: '打开 AI 导购' }).tap()
        await expect(miniProgram.locator('//textarea')).toBeVisible()
      }
      if (state === 'streaming') {
        await miniProgram.locator('//textarea').fill('买 1 盒牛奶')
        await miniProgram.locator(classXPath('agent-composer__submit')).tap()
        await expect.poll(async () => {
          const observed = await miniProgram.inspectAgent()
          return observed.status === 'streaming' && observed.sourceLength > 0
        }, { timeout: 30_000 }).toBe(true)
      }
      expect(await miniProgram.screenshot(`mall-agent-${state}`)).toMatch(/\.png$/)
      if (state === 'streaming') { expect((await miniProgram.inspectAgent()).status).toBe('streaming') }
    })
  }
})
