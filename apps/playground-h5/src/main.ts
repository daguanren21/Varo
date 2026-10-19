import type { Component } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { createApp, h } from 'vue'
import App from './App.vue'
import ActivityDemo from './features/ActivityDemo.vue'
import AgentDisclosureDemo from './features/AgentDisclosureDemo.vue'
import ApplicationBlocksDemo from './features/ApplicationBlocksDemo.vue'
import AttachmentDemo from './features/AttachmentDemo.vue'
import DataWorkspaceDemo from './features/DataWorkspaceDemo.vue'
import FileTypeDemo from './features/FileTypeDemo.vue'
import MarketingBlocksDemo from './features/MarketingBlocksDemo.vue'
import ModelCompareDemo from './features/ModelCompareDemo.vue'
import NavigationUpgradeDemo from './features/NavigationUpgradeDemo.vue'
import OperationsDemo from './features/OperationsDemo.vue'
import SignatureHistoryDemo from './features/SignatureHistoryDemo.vue'
import SourceChatDemo from './features/SourceChatDemo.vue'
import TimeFieldDemo from './features/TimeFieldDemo.vue'
import WorkspaceDemo from './features/WorkspaceDemo.vue'
import './styles/varo.css'
import './styles.css'

const theme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
})

const demo = new URLSearchParams(window.location.search).get('demo')
let root: Component = App
if (demo === 'source-chat') { root = SourceChatDemo }
else if (demo === 'workspace') { root = WorkspaceDemo }
else if (demo === 'activity') { root = ActivityDemo }
else if (demo === 'application-blocks') { root = ApplicationBlocksDemo }
else if (demo === 'marketing-blocks') { root = MarketingBlocksDemo }
else if (demo === 'model-compare') { root = ModelCompareDemo }
else if (demo === 'operations') { root = OperationsDemo }
else if (demo === 'data-workspace') { root = DataWorkspaceDemo }
else if (demo === 'attachments') { root = AttachmentDemo }
else if (demo === 'component-navigation') { root = NavigationUpgradeDemo }
else if (demo === 'time-field') { root = TimeFieldDemo }
else if (demo === 'file-type') { root = FileTypeDemo }
else if (demo === 'agent-disclosure') { root = AgentDisclosureDemo }
else if (demo === 'signature-history') { root = SignatureHistoryDemo }

const componentDemos: Record<string, true> = {
  'component-navigation': true,
  'time-field': true,
  'file-type': true,
  'agent-disclosure': true,
  'signature-history': true,
}
const surface = Object.hasOwn(componentDemos, demo ?? '')
  ? {
      render: () => h('div', [
        h('nav', { 'aria-label': '组件导航', 'style': 'padding:8px 16px;background:var(--varo-ui-bg)' }, [
          h('a', { href: '?', style: 'color:var(--varo-ui-primary);font-size:14px' }, '返回组件目录'),
        ]),
        h(root),
      ]),
    }
  : root

createApp(surface).use(VaroConfigProvider, { theme }).mount('#app')
