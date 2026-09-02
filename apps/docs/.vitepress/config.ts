import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'

const workspacePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))
const docsBase = process.env.DOCS_BASE || '/'
const docsAsset = (path: string) => `${docsBase}${path.replace(/^\/+/, '')}`

export default defineConfig({
  title: 'Varo',
  description: '面向 H5 与小程序封装的 primitives-first Vue 组件体系。',
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
      description: '面向 H5 与小程序封装的 primitives-first Vue 组件体系。',
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
          { text: '开始', link: '/guide/installation' },
          { text: '组件', link: '/components/' },
          { text: 'AI Agent', link: '/ai/' },
          { text: 'Primitives', link: '/primitives/' },
          { text: 'Blocks', link: '/blocks/build-your-own' },
          {
            text: '资源',
            items: [
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
              {
                text: '基础组件',
                collapsed: true,
                items: [
                  { text: 'Button 按钮', link: '/components/button' },
                  { text: 'Badge 徽标', link: '/components/badge' },
                  { text: 'Cell 单元格', link: '/components/cell' },
                  { text: 'Image 图片', link: '/components/image' },
                  { text: 'Input 输入框', link: '/components/input' },
                ],
              },
              {
                text: '表单组件',
                collapsed: true,
                items: [
                  { text: 'Calendar 日历', link: '/components/calendar' },
                  { text: 'CalendarCard 日历卡片', link: '/components/calendar-card' },
                  { text: 'Cascader 级联选择器', link: '/components/cascader' },
                  { text: 'Checkbox 复选按钮', link: '/components/checkbox' },
                  { text: 'DatePicker 日期选择器', link: '/components/date-picker' },
                  { text: 'Form 表单', link: '/components/form' },
                  { text: 'InputNumber 数字输入框', link: '/components/input-number' },
                  { text: 'NumberKeyboard 数字键盘', link: '/components/number-keyboard' },
                  { text: 'Picker 选择器', link: '/components/picker' },
                  { text: 'Radio 单选按钮', link: '/components/radio' },
                  { text: 'Select 选择器', link: '/components/select' },
                  { text: 'Switch 开关', link: '/components/switch' },
                  { text: 'Range 区间选择器', link: '/components/range' },
                  { text: 'Rate 评分', link: '/components/rate' },
                  { text: 'Searchbar 搜索栏', link: '/components/searchbar' },
                  { text: 'ShortPassword 短密码', link: '/components/short-password' },
                  { text: 'Textarea 文本域', link: '/components/textarea' },
                  { text: 'Uploader 上传', link: '/components/uploader' },
                ],
              },
              {
                text: '布局组件',
                collapsed: true,
                items: [
                  { text: 'Divider 分割线', link: '/components/divider' },
                  { text: 'Grid 宫格', link: '/components/grid' },
                  { text: 'Layout 布局', link: '/components/layout' },
                  { text: 'Space 间距', link: '/components/space' },
                  { text: 'Sticky 粘性布局', link: '/components/sticky' },
                ],
              },
              {
                text: '导航组件',
                collapsed: true,
                items: [
                  { text: 'Elevator 电梯楼层', link: '/components/elevator' },
                  { text: 'FixedNav 悬浮导航', link: '/components/fixed-nav' },
                  { text: 'Indicator 指示器', link: '/components/indicator' },
                  { text: 'Menu 菜单', link: '/components/menu' },
                  { text: 'Navbar 头部导航', link: '/components/navbar' },
                  { text: 'Pagination 分页', link: '/components/pagination' },
                  { text: 'SideNavbar 侧边栏导航', link: '/components/side-navbar' },
                  { text: 'Tabbar 标签栏', link: '/components/tabbar' },
                  { text: 'Tabs 选项卡切换', link: '/components/tabs' },
                ],
              },
              {
                text: '反馈组件',
                collapsed: true,
                items: [
                  { text: 'Loading 加载', link: '/components/loading' },
                  { text: 'Skeleton 骨架屏', link: '/components/skeleton' },
                  { text: 'Overlay 遮罩层', link: '/components/overlay' },
                  { text: 'Popup 弹出层', link: '/components/popup' },
                  { text: 'Toast 轻提示', link: '/components/toast' },
                ],
              },
              {
                text: '高级组件',
                collapsed: true,
                items: [
                  { text: 'Popover 气泡浮层', link: '/components/popover' },
                  { text: 'Dialog 对话框', link: '/components/dialog' },
                  { text: 'RegionPicker 地区选择', link: '/components/region-picker' },
                  { text: 'Map 小程序地图', link: '/components/map' },
                  { text: 'RobotChat 机器人对话', link: '/components/robot-chat' },
                ],
              },
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
      description: 'A primitives-first Vue component library for H5 and mini-program wrappers.',
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
          { text: 'Start', link: '/en/guide/installation' },
          { text: 'Components', link: '/en/components/' },
          { text: 'AI Agent', link: '/en/ai/' },
          { text: 'Primitives', link: '/en/primitives/' },
          { text: 'Blocks', link: '/en/blocks/build-your-own' },
          {
            text: 'Resources',
            items: [
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
              {
                text: 'Basic',
                collapsed: true,
                items: [
                  { text: 'Button', link: '/en/components/button' },
                  { text: 'Badge', link: '/en/components/badge' },
                  { text: 'Cell', link: '/en/components/cell' },
                  { text: 'Image', link: '/en/components/image' },
                  { text: 'Input', link: '/en/components/input' },
                ],
              },
              {
                text: 'Form Components',
                collapsed: true,
                items: [
                  { text: 'Calendar', link: '/en/components/calendar' },
                  { text: 'CalendarCard', link: '/en/components/calendar-card' },
                  { text: 'Cascader', link: '/en/components/cascader' },
                  { text: 'Checkbox', link: '/en/components/checkbox' },
                  { text: 'DatePicker', link: '/en/components/date-picker' },
                  { text: 'Form', link: '/en/components/form' },
                  { text: 'InputNumber', link: '/en/components/input-number' },
                  { text: 'NumberKeyboard', link: '/en/components/number-keyboard' },
                  { text: 'Picker', link: '/en/components/picker' },
                  { text: 'Radio', link: '/en/components/radio' },
                  { text: 'Select', link: '/en/components/select' },
                  { text: 'Switch', link: '/en/components/switch' },
                  { text: 'Range', link: '/en/components/range' },
                  { text: 'Rate', link: '/en/components/rate' },
                  { text: 'Searchbar', link: '/en/components/searchbar' },
                  { text: 'ShortPassword', link: '/en/components/short-password' },
                  { text: 'Textarea', link: '/en/components/textarea' },
                  { text: 'Uploader', link: '/en/components/uploader' },
                ],
              },
              {
                text: 'Layout',
                collapsed: true,
                items: [
                  { text: 'Divider', link: '/en/components/divider' },
                  { text: 'Grid', link: '/en/components/grid' },
                  { text: 'Layout', link: '/en/components/layout' },
                  { text: 'Space', link: '/en/components/space' },
                  { text: 'Sticky', link: '/en/components/sticky' },
                ],
              },
              {
                text: 'Navigation',
                collapsed: true,
                items: [
                  { text: 'Elevator', link: '/en/components/elevator' },
                  { text: 'FixedNav', link: '/en/components/fixed-nav' },
                  { text: 'Indicator', link: '/en/components/indicator' },
                  { text: 'Menu', link: '/en/components/menu' },
                  { text: 'Navbar', link: '/en/components/navbar' },
                  { text: 'Pagination', link: '/en/components/pagination' },
                  { text: 'SideNavbar', link: '/en/components/side-navbar' },
                  { text: 'Tabbar', link: '/en/components/tabbar' },
                  { text: 'Tabs', link: '/en/components/tabs' },
                ],
              },
              {
                text: 'Feedback',
                collapsed: true,
                items: [
                  { text: 'Loading', link: '/en/components/loading' },
                  { text: 'Skeleton', link: '/en/components/skeleton' },
                  { text: 'Overlay', link: '/en/components/overlay' },
                  { text: 'Popup', link: '/en/components/popup' },
                  { text: 'Toast', link: '/en/components/toast' },
                ],
              },
              {
                text: 'Advanced',
                collapsed: true,
                items: [
                  { text: 'Popover', link: '/en/components/popover' },
                  { text: 'Dialog', link: '/en/components/dialog' },
                  { text: 'RegionPicker', link: '/en/components/region-picker' },
                  { text: 'Map', link: '/en/components/map' },
                  { text: 'RobotChat', link: '/en/components/robot-chat' },
                ],
              },
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
