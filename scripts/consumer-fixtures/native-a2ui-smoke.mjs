import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { setTimeout as delay } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

async function until(check) {
  const deadline = Date.now() + 6000
  while (true) {
    try {
      return await check()
    }
    catch (error) {
      if (Date.now() >= deadline) { throw error }
      await delay(75)
    }
  }
}

export async function verifyA2uiRuntime(projectPath) {
  const playgroundRequire = createRequire(new URL('../../apps/playground-weapp/package.json', import.meta.url))
  const manifestUrl = pathToFileURL(playgroundRequire.resolve('@weapp-vite/miniprogram-automator/package.json'))
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))
  const { Launcher } = await import(new URL(manifest.exports['.'].import, manifestUrl).href)
  const program = await new Launcher().launch({ platform: 'wechat', runtimeProvider: 'headless', projectPath })
  try {
    const page = await program.reLaunch('/pages/index/index')
    async function element(xpath) {
      const matches = await page.getElementsByXpath(xpath)
      assert.equal(matches.length, 1, `Expected one native element for ${xpath}`)
      return matches[0]
    }

    const surface = '//*[@data-a2ui-surface="consumer-form"]'
    const input = () => element(`${surface}//*[@data-a2ui-field="name"]//input`)
    const renderedName = async () => (await element(`${surface}//*[@data-a2ui-text="preview"]`)).text()
    const receipt = async () => JSON.parse(await (await element('//*[@id="action-receipt"]')).text())

    const editor = await until(async () => {
      const node = await input()
      assert.equal(await node.attr('value'), 'Initial name')
      return node
    })
    assert.equal(await renderedName(), 'Initial name')
    await editor.input('Typed name')
    await until(async () => assert.equal(await renderedName(), 'Typed name'))
    assert.equal(await (await input()).attr('value'), 'Typed name')
    assert.deepEqual(await receipt(), { count: 0, message: null })

    await (await element(`${surface}//*[@data-a2ui-button="save"]//button`)).tap()
    await until(async () => {
      const { count, message } = await receipt()
      assert.equal(count, 1, 'Expected exactly one outbound action')
      assert.equal(message.version, '1.0')
      assert.equal(message.action.name, 'saveName')
      assert.equal(message.action.surfaceId, 'consumer-form')
      assert.equal(message.action.sourceComponentId, 'save')
      assert.deepEqual(message.action.context, { name: 'Typed name' })
    })
  }
  finally {
    await program.close()
  }
  console.log('[consumers] A2UI native input reaches the action receipt')
}
