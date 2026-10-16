export interface DocsPreviewScenario {
  id: string
  page: string
  title: string
  description: string
  query: { component: string }
}

const componentGroups = {
  basics: ['button', 'badge', 'avatar', 'card', 'empty', 'icon', 'image', 'progress', 'tag', 'watermark', 'overview'],
  layout: ['breadcrumb', 'cell', 'divider', 'grid', 'layout', 'list', 'safe-area', 'space', 'sticky'],
  navigation: ['indicator', 'menu', 'navbar', 'pagination', 'steps', 'tabbar', 'tabs'],
  input: ['input', 'input-number', 'input-otp', 'searchbar', 'textarea', 'date-field', 'region-picker', 'picker'],
  selection: ['checkbox', 'radio', 'select', 'switch', 'rate', 'form', 'form-array', 'collapse'],
  overlays: ['action-sheet', 'dialog', 'drawer', 'overlay', 'popover', 'popup', 'toast'],
  feedback: ['loading', 'skeleton', 'pull-refresh', 'swipe-cell', 'signature', 'notice-bar'],
} as const

const primitiveNames = ['accordion', 'button', 'cell', 'checkbox', 'collapsible', 'dialog', 'image', 'input', 'number-field', 'overlay', 'popover', 'popup', 'radio-group', 'select', 'sticky', 'switch', 'tabs'] as const

export const docsPreviewScenarios: readonly DocsPreviewScenario[] = [
  ...Object.entries(componentGroups).flatMap(([group, names]) => names.map(component => ({
    id: `docs-${component}`,
    page: `docs-preview/docs-${group}/index`,
    title: component,
    description: `${component} documentation example`,
    query: { component },
  }))),
  ...['map', 'robot-chat'].map(component => ({
    id: `docs-${component}`,
    page: component === 'robot-chat' ? 'pages/docs-robot-chat/index' : 'docs-preview/docs-native-only/index',
    title: component,
    description: `${component} native documentation example`,
    query: { component },
  })),
  ...primitiveNames.map(component => ({
    id: `primitive-${component}`,
    page: 'docs-preview/docs-primitives/index',
    title: component,
    description: `${component} primitive example`,
    query: { component },
  })),
]

const byId: Record<string, DocsPreviewScenario> = Object.fromEntries(docsPreviewScenarios.map(scenario => [scenario.id, scenario]))

export function resolveDocsPreview(component: string, surface: 'component' | 'primitive' = 'component'): DocsPreviewScenario | undefined {
  return byId[`${surface === 'primitive' ? 'primitive' : 'docs'}-${component}`]
}
