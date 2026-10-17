import type { Component } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { createApp } from 'vue'
import App from './App.vue'
import ActivityDemo from './features/ActivityDemo.vue'
import ApplicationBlocksDemo from './features/ApplicationBlocksDemo.vue'
import AttachmentDemo from './features/AttachmentDemo.vue'
import DataWorkspaceDemo from './features/DataWorkspaceDemo.vue'
import MarketingBlocksDemo from './features/MarketingBlocksDemo.vue'
import ModelCompareDemo from './features/ModelCompareDemo.vue'
import OperationsDemo from './features/OperationsDemo.vue'
import SourceChatDemo from './features/SourceChatDemo.vue'
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

createApp(root).use(VaroConfigProvider, { theme }).mount('#app')
