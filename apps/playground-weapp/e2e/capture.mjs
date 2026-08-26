import { Launcher } from '@weapp-vite/miniprogram-automator'

const launcher = new Launcher()
const miniProgram = await launcher.connect({
  wsEndpoint: process.env.WECHAT_AUTOMATION_ENDPOINT ?? 'ws://127.0.0.1:9421'
})


try {
  await miniProgram.reLaunch('/pages/mall/index')
  await miniProgram.waitForAppReady(30_000)
  const page = await miniProgram.currentPage()
  if (process.env.WEAPP_CAPTURE_AGENT_STREAM === '1') {
    await page.setData({ agentOpen: true })
    await page.callMethod('automationRunPurchase')
    await page.waitFor(2_500)
    await page.waitFor(300)
  } else if (process.env.WEAPP_CAPTURE_AGENT === '1') {
    await page.setData({ agentOpen: true })
    await page.waitFor(300)
  }
  await miniProgram.screenshot({
    path: process.env.WEAPP_SCREENSHOT_PATH ?? '/tmp/varo-ai-mall.png',
    timeout: 30_000
  })
  console.log(process.env.WEAPP_SCREENSHOT_PATH ?? '/tmp/varo-ai-mall.png')
} finally {
  miniProgram.disconnect()
}
