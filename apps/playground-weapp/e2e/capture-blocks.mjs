import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Launcher } from '@weapp-vite/miniprogram-automator'

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
    for (const block of blocks) {
      const route = `/retail-showcase/index/index?block=${encodeURIComponent(block)}&capture=1`
      const page = await miniProgram.reLaunch(route)
      await page.waitFor(1_500)
      const path = resolve(outputDirectory, `${block}.png`)
      await miniProgram.screenshot({ path, timeout: 30_000 })
      process.stdout.write(`${block}: ${path}\n`)
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
