import assert from 'node:assert/strict'
import { Launcher } from '@weapp-vite/miniprogram-automator'

async function main() {
  const launcher = new Launcher()
  const miniProgram = await launcher.connect({
    wsEndpoint: process.env.WECHAT_AUTOMATION_ENDPOINT ?? 'ws://127.0.0.1:9421',
  })

  function normalizePagePath(path) {
    return path.replace(/^\/+/, '')
  }
  const markdownErrors = []
  miniProgram.on('console', (payload) => {
    const args = Array.isArray(payload?.args) ? payload.args : []
    args.forEach((argument) => {
      if (typeof argument === 'string' && argument.includes('[Varo AgentMarkdown]')) {
        markdownErrors.push(argument)
      }
    })
  })
  async function waitForAutomationState(page, predicate, timeout = 30_000) {
    const startedAt = Date.now()
    let lastState
    while (Date.now() - startedAt < timeout) {
      lastState = await page.callMethod('automationInspect')
      if (predicate(lastState)) { return lastState }
      await page.waitFor(100)
    }
    throw new Error(`Timed out waiting for Mall Agent page state: ${JSON.stringify(lastState)}`)
  }

  try {
    const page = await miniProgram.reLaunch('/pages/mall/index')
    await page.waitFor(500)
    assert.equal(normalizePagePath(page.path), 'pages/mall/index')

    await page.setData({ agentOpen: true })
    const initialState = await page.callMethod('automationInspect')
    assert.equal(await page.callMethod('automationRunPurchase'), true)
    const streamingState = await waitForAutomationState(
      page,
      state => state.status === 'streaming' && state.sourceLength > 0,
    )
    assert.ok(streamingState.reasoningCount > 0, 'Agent reasoning must reach the page renderer')
    assert.ok(streamingState.toolCount > 0, 'Agent tool state must reach the page renderer')

    await waitForAutomationState(page, state => state.pendingAction === 'purchase' && !state.busy)
    assert.equal(await page.callMethod('automationApprovePurchase'), true)
    const purchasedState = await waitForAutomationState(page, state => state.orderCount === initialState.orderCount + 1)
    assert.equal(purchasedState.latestProduct, 'milk')
    assert.equal(purchasedState.latestStatus, 'paid')
    assert.deepEqual(markdownErrors, [], 'Agent Markdown must parse without runtime fallback')
    console.log(JSON.stringify({
      agentPanel: 'open',
      page: normalizePagePath(page.path),
      purchase: 'approved',
      sourceLength: streamingState.sourceLength,
      status: 'ok',
    }))
  }
  finally {
    miniProgram.disconnect()
  }
}

void main()
