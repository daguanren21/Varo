import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const workspacePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))

export default defineConfig({
  title: 'Varo',
  description: '面向 H5 与小程序封装的 primitives-first Vue 组件体系。',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }]
  ],
  vite: {
    resolve: {
      alias: {
        '@varo/shared': workspacePath('../../../packages/shared/src/index.ts'),
        '@varo/utils': workspacePath('../../../packages/utils/src/index.ts'),
        '@varo/theme': workspacePath('../../../packages/theme/src/index.ts'),
        '@varo/primitives-core': workspacePath('../../../packages/primitives-core/src/index.ts'),
        '@varo/primitives-h5': workspacePath('../../../packages/primitives-h5/src/index.ts'),
        '@varo/ui-h5/source/style.css': workspacePath('../../../packages/ui-h5/src/style.css'),
        '@varo/ui-h5': workspacePath('../../../packages/ui-h5/src/index.ts')
      }
    }
  },
  themeConfig: {
    logo: '/brand-assets/varo-runtime-mark.png'
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Varo',
      description: '面向 H5 与小程序封装的 primitives-first Vue 组件体系。',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/installation' },
          { text: '组件', link: '/components/button' },
          { text: 'Primitives', link: '/primitives/' },
          { text: 'Blocks', link: '/blocks/profile-edit' },
          { text: '示例', link: '/examples/' },
          { text: '主题', link: '/guide/theme' },
          { text: '色彩', link: '/guide/colors' },
          { text: '国际化', link: '/guide/i18n' },
          { text: '贡献', link: '/guide/contributing' }
        ],
        sidebar: [
          {
            text: '开始使用',
            items: [
              { text: '安装指南', link: '/guide/installation' },
              { text: 'shadcn 模式', link: '/guide/shadcn-mode' },
              { text: '主题配置', link: '/guide/theme' },
              { text: '色彩系统', link: '/guide/colors' },
              { text: '国际化配置', link: '/guide/i18n' }
            ]
          },
          {
            text: '组件文档',
            items: [
              {
                text: '基础组件',
                collapsed: false,
                items: [
                  { text: 'Button 按钮', link: '/components/button' },
                  { text: 'Cell 单元格', link: '/components/cell' },
                  { text: 'Image 图片', link: '/components/image' },
                  { text: 'Input 输入框', link: '/components/input' }
                ]
              },
              {
                text: '表单组件',
                collapsed: false,
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
                  { text: 'Uploader 上传', link: '/components/uploader' }
                ]
              },
              {
                text: '布局组件',
                collapsed: false,
                items: [
                  { text: 'Divider 分割线', link: '/components/divider' },
                  { text: 'Grid 宫格', link: '/components/grid' },
                  { text: 'Layout 布局', link: '/components/layout' },
                  { text: 'Space 间距', link: '/components/space' },
                  { text: 'Sticky 粘性布局', link: '/components/sticky' }
                ]
              },
              {
                text: '导航组件',
                collapsed: false,
                items: [
                  { text: 'Elevator 电梯楼层', link: '/components/elevator' },
                  { text: 'FixedNav 悬浮导航', link: '/components/fixed-nav' },
                  { text: 'Indicator 指示器', link: '/components/indicator' },
                  { text: 'Menu 菜单', link: '/components/menu' },
                  { text: 'Navbar 头部导航', link: '/components/navbar' },
                  { text: 'Pagination 分页', link: '/components/pagination' },
                  { text: 'SideNavbar 侧边栏导航', link: '/components/side-navbar' },
                  { text: 'Tabbar 标签栏', link: '/components/tabbar' },
                  { text: 'Tabs 选项卡切换', link: '/components/tabs' }
                ]
              },
              {
                text: '反馈组件',
                collapsed: false,
                items: [
                  { text: 'Loading 加载', link: '/components/loading' },
                  { text: 'Overlay 遮罩层', link: '/components/overlay' },
                  { text: 'Popup 弹出层', link: '/components/popup' },
                  { text: 'Toast 轻提示', link: '/components/toast' }
                ]
              },
              {
                text: '高级组件',
                collapsed: false,
                items: [{ text: 'Dialog 对话框', link: '/components/dialog' }]
              }
            ]
          },
          {
            text: 'Primitives',
            items: [{ text: '交互 Primitives', link: '/primitives/' }]
          },
          {
            text: 'Blocks',
            items: [
              { text: 'Profile Edit', link: '/blocks/profile-edit' },
              { text: 'Order Filter', link: '/blocks/order-filter' }
            ]
          },
          {
            text: '示例',
            items: [{ text: '跨端演示', link: '/examples/' }]
          },
          {
            text: '社区',
            items: [{ text: '如何贡献', link: '/guide/contributing' }]
          }
        ],
        outline: { level: [2, 3], label: '本页导航' },
        docFooter: { prev: '上一页', next: '下一页' },
        darkModeSwitchLabel: '外观',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部'
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Varo',
      description: 'A primitives-first Vue component library for H5 and mini-program wrappers.',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/installation' },
          { text: 'Components', link: '/en/components/button' },
          { text: 'Primitives', link: '/en/primitives/' },
          { text: 'Blocks', link: '/en/blocks/profile-edit' },
          { text: 'Examples', link: '/en/examples/' },
          { text: 'Theme', link: '/en/guide/theme' },
          { text: 'Colors', link: '/en/guide/colors' },
          { text: 'I18n', link: '/en/guide/i18n' },
          { text: 'Contributing', link: '/en/guide/contributing' }
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Installation', link: '/en/guide/installation' },
              { text: 'shadcn Mode', link: '/en/guide/shadcn-mode' },
              { text: 'Theme', link: '/en/guide/theme' },
              { text: 'Color System', link: '/en/guide/colors' },
              { text: 'Internationalization', link: '/en/guide/i18n' }
            ]
          },
          {
            text: 'Components',
            items: [
              {
                text: 'Basic',
                collapsed: false,
                items: [
                  { text: 'Button', link: '/en/components/button' },
                  { text: 'Cell', link: '/en/components/cell' },
                  { text: 'Image', link: '/en/components/image' },
                  { text: 'Input', link: '/en/components/input' }
                ]
              },
              {
                text: 'Form Components',
                collapsed: false,
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
                  { text: 'Uploader', link: '/en/components/uploader' }
                ]
              },
              {
                text: 'Layout',
                collapsed: false,
                items: [
                  { text: 'Divider', link: '/en/components/divider' },
                  { text: 'Grid', link: '/en/components/grid' },
                  { text: 'Layout', link: '/en/components/layout' },
                  { text: 'Space', link: '/en/components/space' },
                  { text: 'Sticky', link: '/en/components/sticky' }
                ]
              },
              {
                text: 'Navigation',
                collapsed: false,
                items: [
                  { text: 'Elevator', link: '/en/components/elevator' },
                  { text: 'FixedNav', link: '/en/components/fixed-nav' },
                  { text: 'Indicator', link: '/en/components/indicator' },
                  { text: 'Menu', link: '/en/components/menu' },
                  { text: 'Navbar', link: '/en/components/navbar' },
                  { text: 'Pagination', link: '/en/components/pagination' },
                  { text: 'SideNavbar', link: '/en/components/side-navbar' },
                  { text: 'Tabbar', link: '/en/components/tabbar' },
                  { text: 'Tabs', link: '/en/components/tabs' }
                ]
              },
              {
                text: 'Feedback',
                collapsed: false,
                items: [
                  { text: 'Loading', link: '/en/components/loading' },
                  { text: 'Overlay', link: '/en/components/overlay' },
                  { text: 'Popup', link: '/en/components/popup' },
                  { text: 'Toast', link: '/en/components/toast' }
                ]
              },
              {
                text: 'Advanced',
                collapsed: false,
                items: [{ text: 'Dialog', link: '/en/components/dialog' }]
              }
            ]
          },
          {
            text: 'Primitives',
            items: [{ text: 'Interactive Primitives', link: '/en/primitives/' }]
          },
          {
            text: 'Blocks',
            items: [
              { text: 'Profile Edit', link: '/en/blocks/profile-edit' },
              { text: 'Order Filter', link: '/en/blocks/order-filter' }
            ]
          },
          {
            text: 'Examples',
            items: [{ text: 'Cross-platform Demo', link: '/en/examples/' }]
          },
          {
            text: 'Community',
            items: [{ text: 'Contributing', link: '/en/guide/contributing' }]
          }
        ],
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top'
      }
    }
  }
})
