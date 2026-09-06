import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { createComponentSidebarGroups } from '../src/component-catalog.js'

const workspacePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))
const docsBase = process.env.DOCS_BASE || '/'
const docsAsset = (path: string) => `${docsBase}${path.replace(/^\/+/, '')}`

export default defineConfig({
  title: 'Varo',
  description: '面向 Vue 3 H5 与 Wevu 小程序的 Registry-first 双端移动 UI 系统。',
  base: docsBase,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: docsAsset('/brand-assets/varo-symbol.svg') }],
    ['link', { rel: 'alternate icon', href: docsAsset('/favicon.ico') }],
    ['link', { rel: 'apple-touch-icon', href: docsAsset('/apple-touch-icon.png') }],
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f7f8fa' }],
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0b1016' }],
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@varo-ui/ai': workspacePath('../../../packages/agent-core/src/index.ts'),
        '@varo/shared': workspacePath('../../../packages/shared/src/index.ts'),
        '@varo/utils': workspacePath('../../../packages/utils/src/index.ts'),
        '@varo-ui/theme': workspacePath('../../../packages/theme/src/index.ts'),
        '@varo-ui/headless': workspacePath('../../../packages/primitives-core/src/index.ts'),
        '@varo/primitives-h5': workspacePath('../../../packages/primitives-h5/src/index.ts'),
        '@varo-ui/h5/source/style.css': workspacePath('../../../packages/ui-h5/src/style.css'),
        '@varo-ui/h5': workspacePath('../../../packages/ui-h5/src/index.ts'),
        '@varo-ui/weapp': workspacePath('../../../packages/ui-weapp/src/index.ts'),
      },
    },
  },
  themeConfig: {
    logo: {
      light: '/brand-assets/varo-lockup.svg',
      dark: '/brand-assets/varo-lockup-dark.svg',
      alt: 'Varo',
    },
    siteTitle: false,
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '返回',
            noResultsText: '未找到相关文档',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
        locales: {
          en: {
            translations: {
              button: { buttonText: 'Search docs', buttonAriaLabel: 'Search documentation' },
              modal: {
                displayDetails: 'Display details',
                resetButtonTitle: 'Clear search',
                backButtonTitle: 'Back',
                noResultsText: 'No matching documentation found',
                footer: {
                  selectText: 'Select',
                  navigateText: 'Navigate',
                  closeText: 'Close',
                },
              },
            },
          },
        },
      },
    },
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Varo',
      description: '面向 Vue 3 H5 与 Wevu 小程序的 Registry-first 双端移动 UI 系统。',
      themeConfig: {
        search: {
          provider: 'local',
          options: {
            detailedView: true,
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清除搜索',
                backButtonTitle: '返回',
                noResultsText: '未找到相关文档',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
        nav: [
          { text: 'Registry', link: '/guide/installation' },
          { text: '组件', link: '/components/' },
          { text: 'Blocks', link: '/blocks/build-your-own' },
          { text: 'AI Agent', link: '/ai/' },
          {
            text: '文档与资源',
            items: [
              { text: 'Primitives', link: '/primitives/' },
              { text: '跨端示例', link: '/examples/' },
              { text: '主题配置', link: '/guide/theme' },
              { text: '色彩系统', link: '/guide/colors' },
              { text: '国际化', link: '/guide/i18n' },
              { text: '参与贡献', link: '/guide/contributing' },
            ],
          },
        ],
        sidebar: [
          {
            text: '开始使用',
            items: [
              { text: '安装指南', link: '/guide/installation' },
              { text: 'Wevu Registry', link: '/guide/shadcn-mode' },
              { text: '主题配置', link: '/guide/theme' },
              { text: '色彩系统', link: '/guide/colors' },
              { text: '国际化配置', link: '/guide/i18n' },
            ],
          },
          {
            text: '组件文档',
            items: [
              { text: '组件总览', link: '/components/' },
              ...createComponentSidebarGroups('zh'),
            ],
          },
          {
            text: 'AI Agent 组件',
            items: [
              { text: '总览与实时演示', link: '/ai/' },
              {
                text: '对话与流式',
                collapsed: true,
                items: [
                  { text: 'AgentLoading', link: '/ai/loading' },
                  { text: 'AgentThinking', link: '/ai/thinking' },
                  { text: 'AgentMarkdown', link: '/ai/markdown' },
                  { text: 'AgentStream', link: '/ai/stream' },
                  { text: 'AgentMessage', link: '/ai/message' },
                  { text: 'AgentConversation', link: '/ai/conversation' },
                  { text: 'AgentMessageScroller', link: '/ai/message-scroller' },
                ],
              },
              {
                text: '执行与审批',
                collapsed: true,
                items: [
                  { text: 'AgentToolChip', link: '/ai/tool-chip' },
                  { text: 'AgentToolResult', link: '/ai/tool-result' },
                  { text: 'AgentTaskList', link: '/ai/task-list' },
                  { text: 'AgentActivity', link: '/ai/activity' },
                  { text: 'AgentApproval', link: '/ai/approval' },
                  { text: 'AgentToolApproval', link: '/ai/tool-approval' },
                  { text: 'AgentRecommendation', link: '/ai/recommendation' },
                  { text: 'AgentEventRenderer', link: '/ai/event-renderer' },
                ],
              },
              {
                text: '输入与操作',
                collapsed: true,
                items: [
                  { text: 'AgentRadioGroup', link: '/ai/radio-group' },
                  { text: 'AgentPromptSuggestions', link: '/ai/prompt-suggestions' },
                  { text: 'AgentComposer', link: '/ai/composer' },
                  { text: 'AgentResponseActions', link: '/ai/response-actions' },
                  { text: 'AgentSelectionActions', link: '/ai/selection-actions' },
                  { text: 'AgentCommandSearch', link: '/ai/command-search' },
                ],
              },
              {
                text: '上下文与产物',
                collapsed: true,
                items: [
                  { text: 'AgentArtifact', link: '/ai/artifact' },
                  { text: 'AgentAttachmentList', link: '/ai/attachments' },
                  { text: 'AgentSourceList', link: '/ai/sources' },
                  { text: 'AgentCitations', link: '/ai/citations' },
                  { text: 'AgentContextCard', link: '/ai/context-card' },
                  { text: 'AgentCodeBlock', link: '/ai/code-block' },
                  { text: 'AgentFileDiff', link: '/ai/file-diff' },
                  { text: 'AgentImageGeneration', link: '/ai/image-generation' },
                ],
              },
              {
                text: '数据与工作区',
                collapsed: true,
                items: [
                  { text: 'AgentSidebar', link: '/ai/sidebar' },
                  { text: 'AgentInsightCard', link: '/ai/insight-card' },
                  { text: 'AgentDiffTable', link: '/ai/diff-table' },
                  { text: 'AgentRecordsTable', link: '/ai/records-table' },
                  { text: 'AgentFilterTable', link: '/ai/filter-table' },
                  { text: 'AgentFlowchart', link: '/ai/flowchart' },
                  { text: 'AgentFineTune', link: '/ai/fine-tune' },
                  { text: 'AgentChat Block', link: '/ai/agent-chat' },
                ],
              },
            ],
          },
          {
            text: 'Primitives',
            items: [
              { text: '总览', link: '/primitives/' },
              {
                text: '基础控件',
                collapsed: false,
                items: [
                  { text: 'Button', link: '/primitives/button' },
                  { text: 'Input', link: '/primitives/input' },
                ],
              },
              {
                text: '选择与切换',
                collapsed: false,
                items: [
                  { text: 'Number Field', link: '/primitives/number-field' },
                  { text: 'Checkbox', link: '/primitives/checkbox' },
                  { text: 'Radio Group', link: '/primitives/radio-group' },
                  { text: 'Switch', link: '/primitives/switch' },
                  { text: 'Tabs', link: '/primitives/tabs' },
                  { text: 'Select', link: '/primitives/select' },
                ],
              },
              {
                text: '内容与布局',
                collapsed: false,
                items: [
                  { text: 'Image', link: '/primitives/image' },
                  { text: 'Cell', link: '/primitives/cell' },
                  { text: 'Sticky', link: '/primitives/sticky' },
                ],
              },
              {
                text: '展开与轻浮层',
                collapsed: false,
                items: [
                  { text: 'Collapsible', link: '/primitives/collapsible' },
                  { text: 'Accordion', link: '/primitives/accordion' },
                  { text: 'Popover', link: '/primitives/popover' },
                ],
              },
              {
                text: '遮罩与弹层',
                collapsed: false,
                items: [
                  { text: 'Dialog', link: '/primitives/dialog' },
                  { text: 'Overlay', link: '/primitives/overlay' },
                  { text: 'Popup', link: '/primitives/popup' },
                ],
              },
            ],
          },
          {
            text: 'Blocks',
            items: [
              { text: '构建你自己的 Block', link: '/blocks/build-your-own' },
              { text: 'Profile Edit', link: '/blocks/profile-edit' },
              { text: 'Order Filter', link: '/blocks/order-filter' },
              { text: 'Agent Chat', link: '/ai/' },
            ],
          },
          {
            text: '示例',
            items: [{ text: '跨端演示', link: '/examples/' }],
          },
          {
            text: '社区',
            items: [{ text: '如何贡献', link: '/guide/contributing' }],
          },
        ],
        outline: { level: [2, 3], label: '本页导航' },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '外观',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Varo',
      description: 'A Registry-first mobile UI system for Vue 3 H5 and Wevu mini programs.',
      themeConfig: {
        search: {
          provider: 'local',
          options: {
            detailedView: true,
            translations: {
              button: { buttonText: 'Search docs', buttonAriaLabel: 'Search documentation' },
              modal: {
                displayDetails: 'Display details',
                resetButtonTitle: 'Clear search',
                backButtonTitle: 'Back',
                noResultsText: 'No matching documentation found',
                footer: {
                  selectText: 'Select',
                  navigateText: 'Navigate',
                  closeText: 'Close',
                },
              },
            },
          },
        },
        nav: [
          { text: 'Registry', link: '/en/guide/installation' },
          { text: 'Components', link: '/en/components/' },
          { text: 'Blocks', link: '/en/blocks/build-your-own' },
          { text: 'AI Agent', link: '/en/ai/' },
          {
            text: 'Docs & Resources',
            items: [
              { text: 'Primitives', link: '/en/primitives/' },
              { text: 'Cross-platform Examples', link: '/en/examples/' },
              { text: 'Theme', link: '/en/guide/theme' },
              { text: 'Color System', link: '/en/guide/colors' },
              { text: 'Internationalization', link: '/en/guide/i18n' },
              { text: 'Contributing', link: '/en/guide/contributing' },
            ],
          },
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Installation', link: '/en/guide/installation' },
              { text: 'Wevu Registry', link: '/en/guide/shadcn-mode' },
              { text: 'Theme', link: '/en/guide/theme' },
              { text: 'Color System', link: '/en/guide/colors' },
              { text: 'Internationalization', link: '/en/guide/i18n' },
            ],
          },
          {
            text: 'Components',
            items: [
              { text: 'Overview', link: '/en/components/' },
              ...createComponentSidebarGroups('en'),
            ],
          },
          {
            text: 'AI Agent Components',
            items: [
              { text: 'Overview and Live Demo', link: '/en/ai/' },
              {
                text: 'Conversation and Streaming',
                collapsed: true,
                items: [
                  { text: 'AgentLoading', link: '/en/ai/loading' },
                  { text: 'AgentThinking', link: '/en/ai/thinking' },
                  { text: 'AgentMarkdown', link: '/en/ai/markdown' },
                  { text: 'AgentStream', link: '/en/ai/stream' },
                  { text: 'AgentMessage', link: '/en/ai/message' },
                  { text: 'AgentConversation', link: '/en/ai/conversation' },
                  { text: 'AgentMessageScroller', link: '/en/ai/message-scroller' },
                ],
              },
              {
                text: 'Execution and Approval',
                collapsed: true,
                items: [
                  { text: 'AgentToolChip', link: '/en/ai/tool-chip' },
                  { text: 'AgentToolResult', link: '/en/ai/tool-result' },
                  { text: 'AgentTaskList', link: '/en/ai/task-list' },
                  { text: 'AgentActivity', link: '/en/ai/activity' },
                  { text: 'AgentApproval', link: '/en/ai/approval' },
                  { text: 'AgentToolApproval', link: '/en/ai/tool-approval' },
                  { text: 'AgentRecommendation', link: '/en/ai/recommendation' },
                  { text: 'AgentEventRenderer', link: '/en/ai/event-renderer' },
                ],
              },
              {
                text: 'Prompt and Actions',
                collapsed: true,
                items: [
                  { text: 'AgentRadioGroup', link: '/en/ai/radio-group' },
                  { text: 'AgentPromptSuggestions', link: '/en/ai/prompt-suggestions' },
                  { text: 'AgentComposer', link: '/en/ai/composer' },
                  { text: 'AgentResponseActions', link: '/en/ai/response-actions' },
                  { text: 'AgentSelectionActions', link: '/en/ai/selection-actions' },
                  { text: 'AgentCommandSearch', link: '/en/ai/command-search' },
                ],
              },
              {
                text: 'Context and Artifacts',
                collapsed: true,
                items: [
                  { text: 'AgentArtifact', link: '/en/ai/artifact' },
                  { text: 'AgentAttachmentList', link: '/en/ai/attachments' },
                  { text: 'AgentSourceList', link: '/en/ai/sources' },
                  { text: 'AgentCitations', link: '/en/ai/citations' },
                  { text: 'AgentContextCard', link: '/en/ai/context-card' },
                  { text: 'AgentCodeBlock', link: '/en/ai/code-block' },
                  { text: 'AgentFileDiff', link: '/en/ai/file-diff' },
                  { text: 'AgentImageGeneration', link: '/en/ai/image-generation' },
                ],
              },
              {
                text: 'Data and Workspace',
                collapsed: true,
                items: [
                  { text: 'AgentSidebar', link: '/en/ai/sidebar' },
                  { text: 'AgentInsightCard', link: '/en/ai/insight-card' },
                  { text: 'AgentDiffTable', link: '/en/ai/diff-table' },
                  { text: 'AgentRecordsTable', link: '/en/ai/records-table' },
                  { text: 'AgentFilterTable', link: '/en/ai/filter-table' },
                  { text: 'AgentFlowchart', link: '/en/ai/flowchart' },
                  { text: 'AgentFineTune', link: '/en/ai/fine-tune' },
                  { text: 'AgentChat Block', link: '/en/ai/agent-chat' },
                ],
              },
            ],
          },
          {
            text: 'Primitives',
            items: [
              { text: 'Overview', link: '/en/primitives/' },
              {
                text: 'Foundation',
                collapsed: false,
                items: [
                  { text: 'Button', link: '/en/primitives/button' },
                  { text: 'Input', link: '/en/primitives/input' },
                ],
              },
              {
                text: 'Selection & Toggle',
                collapsed: false,
                items: [
                  { text: 'Number Field', link: '/en/primitives/number-field' },
                  { text: 'Checkbox', link: '/en/primitives/checkbox' },
                  { text: 'Radio Group', link: '/en/primitives/radio-group' },
                  { text: 'Switch', link: '/en/primitives/switch' },
                  { text: 'Tabs', link: '/en/primitives/tabs' },
                  { text: 'Select', link: '/en/primitives/select' },
                ],
              },
              {
                text: 'Content & Layout',
                collapsed: false,
                items: [
                  { text: 'Image', link: '/en/primitives/image' },
                  { text: 'Cell', link: '/en/primitives/cell' },
                  { text: 'Sticky', link: '/en/primitives/sticky' },
                ],
              },
              {
                text: 'Disclosure & Floating',
                collapsed: false,
                items: [
                  { text: 'Collapsible', link: '/en/primitives/collapsible' },
                  { text: 'Accordion', link: '/en/primitives/accordion' },
                  { text: 'Popover', link: '/en/primitives/popover' },
                ],
              },
              {
                text: 'Layers',
                collapsed: false,
                items: [
                  { text: 'Dialog', link: '/en/primitives/dialog' },
                  { text: 'Overlay', link: '/en/primitives/overlay' },
                  { text: 'Popup', link: '/en/primitives/popup' },
                ],
              },
            ],
          },
          {
            text: 'Blocks',
            items: [
              { text: 'Build Your Own Block', link: '/en/blocks/build-your-own' },
              { text: 'Profile Edit', link: '/en/blocks/profile-edit' },
              { text: 'Order Filter', link: '/en/blocks/order-filter' },
              { text: 'Agent Chat', link: '/en/ai/' },
            ],
          },
          {
            text: 'Examples',
            items: [{ text: 'Cross-platform Demo', link: '/en/examples/' }],
          },
          {
            text: 'Community',
            items: [{ text: 'Contributing', link: '/en/guide/contributing' }],
          },
        ],
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
      },
    },
  },
})
