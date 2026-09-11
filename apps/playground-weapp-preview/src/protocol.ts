export const previewChannel = 'varo-weapp-preview'

export const previewScenarios = [
  {
    id: 'controls',
    title: '基础交互',
    page: 'pages/web-preview/index',
    description: '按钮、受控输入、插槽与组件生命周期',
  },
  {
    id: 'agent',
    title: 'Agent 内容',
    page: 'pages/web-preview-agent/index',
    description: '原生 Markdown 与可取消的流式内容',
  },
  {
    id: 'map',
    title: '原生地图',
    page: 'pages/web-preview-map/index',
    description: 'VMap 坐标、标记与 regionchange',
  },
  {
    id: 'robot-chat',
    title: '机器人对话',
    page: 'pages/web-preview-robot-chat/index',
    description: 'chatbotwidget 插件会话面、operateCard 与 queryCallback',
  },
  {
    id: 'rag',
    title: 'RAG 流程',
    page: 'pages/web-preview-rag/index',
    description: '五阶段检索增强生成与来源引用',
  },
] as const

export type PreviewScenarioId = (typeof previewScenarios)[number]['id']

export type PreviewFrameMessage
  = | { channel: typeof previewChannel, type: 'ready', session: string, scenario: PreviewScenarioId, artifact: string }
    | { channel: typeof previewChannel, type: 'error', session: string, scenario: PreviewScenarioId, message: string }

export function isPreviewScenario(value: unknown): value is PreviewScenarioId {
  return previewScenarios.some(scenario => scenario.id === value)
}

export function isPreviewFrameMessage(value: unknown): value is PreviewFrameMessage {
  if (!value || typeof value !== 'object') { return false }
  const candidate = value as Record<string, unknown>
  if (candidate.channel !== previewChannel || typeof candidate.session !== 'string' || !isPreviewScenario(candidate.scenario)) { return false }
  return (candidate.type === 'ready' && typeof candidate.artifact === 'string')
    || (candidate.type === 'error' && typeof candidate.message === 'string')
}
