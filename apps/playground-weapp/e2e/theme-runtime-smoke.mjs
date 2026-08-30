import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { Launcher } from '@weapp-vite/miniprogram-automator'

async function waitForTheme(page, expectedPrimary, timeout = 8_000) {
  const startedAt = Date.now()
  let state
  while (Date.now() - startedAt < timeout) {
    state = await page.callMethod('automationInspectTheme')
    if (state?.primary === expectedPrimary) { return state }
    await page.waitFor(100)
  }
  throw new Error(`Timed out waiting for VThemeProvider theme ${expectedPrimary}: ${JSON.stringify(state)}`)
}

async function main() {
  const launcher = new Launcher()
  const wsEndpoint = process.env.WECHAT_AUTOMATION_ENDPOINT
  const miniProgram = wsEndpoint
    ? await launcher.connect({ wsEndpoint })
    : await launcher.launch({
        platform: 'wechat',
        projectPath: resolve(import.meta.dirname, '../devtools/build'),
        trustProject: true,
      })

  try {
    const page = await miniProgram.reLaunch('/pages/index/index')
    await page.waitFor(300)

    const initialState = await waitForTheme(page, '#08786f')
    assert.equal(initialState.alternate, false)

    assert.equal(await page.callMethod('automationToggleTheme'), true)
    const updatedState = await waitForTheme(page, '#7c3aed')
    assert.equal(updatedState.alternate, true)

    console.log(JSON.stringify({
      page: page.path,
      provider: 'VThemeProvider',
      status: 'ok',
      theme: 'violet',
    }))
  }
  finally {
    if (wsEndpoint) {
      miniProgram.disconnect()
    }
    else {
      await miniProgram.close()
    }
  }
}

void main()
