import assert from 'node:assert/strict'
import { Launcher } from '@weapp-vite/miniprogram-automator'

const blocks = [
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

async function main() {
  const runtimeFailures = []
  const miniProgram = await new Launcher().connect({
    wsEndpoint: process.env.WECHAT_AUTOMATION_ENDPOINT ?? 'ws://127.0.0.1:9422',
  })

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

  try {
    for (const block of blocks) {
      const route = `/retail-showcase/index/index?block=${encodeURIComponent(block)}&capture=1`
      const page = await miniProgram.reLaunch(route)
      await page.waitFor(1_200)
      assert.equal(page.path, 'retail-showcase/index/index')
    }

    assert.deepEqual(runtimeFailures, [], runtimeFailures.join('\n'))
    process.stdout.write(`${JSON.stringify({ blocks: blocks.length, runtime: 'wechat-devtools', status: 'ok' })}\n`)
  }
  finally {
    miniProgram.disconnect()
  }
}

void main()
