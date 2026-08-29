import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { Launcher } from '@weapp-vite/miniprogram-automator'

async function main() {
  const playgroundRoot = resolve(import.meta.dirname, '..')
  const launcher = new Launcher()
  const miniProgram = await launcher.launch({
    platform: 'wechat',
    projectPath: playgroundRoot,
    runtimeProvider: 'headless',
  })

  async function inspectPage(path) {
    const page = await miniProgram.reLaunch(path)
    await page.waitFor(300)
    assert.equal(page.path, path.replace(/^\//, ''))
    assert.ok(await page.$('.varo-button'), `${path} must render a Varo button`)
    assert.ok(await page.$('.varo-card'), `${path} must render a Varo card`)
    const snapshot = await page.snapshot()
    assert.ok(snapshot?.data, `${path} must expose a runtime data snapshot`)
    return page
  }

  try {
    const home = await inspectPage('/pages/retail-home/index')
    assert.ok(await home.$('.varo-input'), 'Retail home must render the Varo search input')
    assert.equal((await home.data('featuredProducts')).length, 8, 'Retail home must expose eight product cards')

    await inspectPage('/pages/retail-category/index')
    const cart = await inspectPage('/pages/retail-cart/index')
    const quantityInput = await cart.$('.varo-input-number__input')
    assert.ok(quantityInput, 'Retail cart must render the quantity value input')
    assert.equal(await quantityInput.attr('value'), '1', 'Retail cart must display the current quantity')
    await inspectPage('/retail-showcase/index/index')
    await inspectPage('/pages/retail-profile/index')

    console.log(JSON.stringify({
      pages: 5,
      runtime: 'headless-wechat',
      status: 'ok',
    }))
  }
  finally {
    await miniProgram.close()
  }
}

void main()
