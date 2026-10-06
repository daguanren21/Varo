/* global wx */

import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { PNG } from 'pngjs'

const availableBlocks = [
  'login-form',
  'profile-card',
  'profile-edit',
  'product-list',
  'order-filter',
  'agent-chat',
  'retail-home',
  'retail-category',
  'retail-cart',
  'retail-product-detail',
  'retail-checkout',
  'retail-order-list',
  'retail-profile',
]
const requestedBlocks = (process.env.WEAPP_CAPTURE_BLOCKS ?? '')
  .split(',')
  .map(block => block.trim())
  .filter(Boolean)
const blocks = requestedBlocks.length
  ? availableBlocks.filter(block => requestedBlocks.includes(block))
  : availableBlocks
if (requestedBlocks.length > 0 && requestedBlocks.length !== blocks.length) {
  throw new Error(`Unknown Block capture request: ${requestedBlocks.filter(block => !availableBlocks.includes(block)).join(', ')}`)
}
const outputDirectory = resolve(import.meta.dirname, '../../docs/public/blocks')

async function main() {
  const launcher = new Launcher()
  const miniProgram = await launcher.connect({
    wsEndpoint: process.env.WECHAT_AUTOMATION_ENDPOINT ?? 'ws://127.0.0.1:9422',
  })
  const runtimeFailures = []

  miniProgram.on('console', (payload) => {
    const args = Array.isArray(payload?.args) ? payload.args : []
    args.forEach((argument) => {
      if (
        typeof argument === 'string'
        && /type-uncompatible|Cannot read propert(?:y|ies).*(?:undefined|null)/i.test(argument)
      ) {
        runtimeFailures.push(argument)
      }
    })
  })

  await mkdir(outputDirectory, { recursive: true })

  try {
    const rawDirectory = await mkdtemp(join(tmpdir(), 'varo-block-captures-'))
    process.stdout.write(`Original DevTools captures: ${rawDirectory}\n`)
    for (const block of blocks) {
      const route = `/retail-showcase/index/index?block=${encodeURIComponent(block)}&capture=1`
      const page = await miniProgram.reLaunch(route)
      await page.waitFor(1_500)
      assert.equal(await page.data('active'), block, 'Capture must show the requested Block')
      // Page.size() reports scroll dimensions, not the visible viewport.
      const viewport = await miniProgram.evaluate(() => wx.getWindowInfo())
      assert.equal(viewport.windowWidth, 375, 'Select a 375px simulator device before capturing Blocks')

      // DevTools windowHeight can include chrome; the showcase's 100vh root measures the rendered viewport.
      const root = await page.getElementByXpath('//view[contains(@class,"min-h-screen")]')
      assert.ok(root, 'Missing showcase viewport root')
      const minHeight = await root.style('min-height')
      assert.match(minHeight, /^\d+(?:\.\d+)?px$/, 'Viewport height must resolve to pixels')
      const renderedViewport = {
        width: (await root.size()).width,
        height: Number.parseFloat(minHeight),
      }
      assert.equal(renderedViewport.width, 375, 'Rendered viewport must also be 375px wide')
      assert.ok(renderedViewport.height > 0 && renderedViewport.height <= viewport.screenHeight, 'Invalid rendered viewport height')

      const bytes = Buffer.from(await miniProgram.screenshot({ timeout: 30_000 }), 'base64')
      await writeFile(resolve(rawDirectory, `${block}.png`), bytes)
      const image = PNG.sync.read(bytes)
      const scale = image.width / renderedViewport.width
      assert.ok(Math.abs(image.height / scale - viewport.screenHeight) <= 1, 'Screenshot must match the simulator screen')
      const top = Math.ceil(image.height - renderedViewport.height * scale)
      const bottomInset = viewport.safeArea ? viewport.screenHeight - viewport.safeArea.bottom : 0
      const height = Math.floor(image.height - bottomInset * scale) - top
      assert.ok(top >= 0 && height > 0 && top + height <= image.height, 'Invalid content viewport bounds')

      const content = new PNG({ width: image.width, height })
      PNG.bitblt(image, content, 0, top, image.width, height, 0, 0)
      await writeFile(resolve(rawDirectory, `${block}.json`), JSON.stringify({
        block,
        capturedAt: new Date().toISOString(),
        viewport,
        renderedViewport,
        crop: { left: 0, top, width: image.width, height },
      }, null, 2))
      const path = resolve(outputDirectory, `${block}.png`)
      await writeFile(path, PNG.sync.write(content))
      process.stdout.write(`${block}: ${path} (375px content viewport)\n`)
    }
    if (runtimeFailures.length > 0) {
      throw new Error(`Block previews emitted runtime contract failures:\n${runtimeFailures.join('\n')}`)
    }
  }
  finally {
    miniProgram.disconnect()
  }
}

void main()
