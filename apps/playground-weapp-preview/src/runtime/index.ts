import type { RuntimeSession } from './entry'
import { mountWeappWebPreview } from '@varo/weapp-web/runtime'
import artifacts from 'virtual:varo-native-artifacts'
import { previewScenarios } from '../protocol'

export async function mountPreview(session: RuntimeSession): Promise<() => void> {
  const mount = document.getElementById('runtime-root')
  if (!mount) { throw new Error('找不到小程序预览挂载点') }
  const pagePath = artifacts.pages[session.scenario]
  if (!pagePath) {
    throw new Error(`未注册的小程序预览场景：${session.scenario}`)
  }
  const scenario = previewScenarios.find(item => item.id === session.scenario)
  if (scenario && scenario.page !== pagePath) {
    throw new Error(`小程序预览场景 ${session.scenario} 的产物路径与协议不一致`)
  }
  return mountWeappWebPreview({
    mount,
    artifacts,
    session: {
      pagePath,
      signal: session.signal,
      ready: session.ready,
      fail: session.fail,
    },
  })
}
