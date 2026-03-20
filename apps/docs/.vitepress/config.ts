import { defineConfig } from 'vitepress'

const githubUrl = process.env.VITE_GITHUB_URL || 'https://github.com/your-org/varo'

export default defineConfig({
  title: 'Varo',
  description: '面向 H5 与小程序封装的 primitives-first Vue 组件体系。',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    resolve: {
      alias: {
        '@varo/shared': '@varo/shared/source',
        '@varo/theme': '@varo/theme/source',
        '@varo/primitives-core': '@varo/primitives-core/source',
        '@varo/primitives-h5': '@varo/primitives-h5/source',
        '@varo/primitives-weapp': '@varo/primitives-weapp/source',
        '@varo/ui-h5': '@varo/ui-h5/source',
        '@varo/ui-weapp': '@varo/ui-weapp/source'
      }
    }
  },
  themeConfig: {
    logo: '/logo.svg'
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
          { text: '示例', link: '/examples/h5' },
          { text: '主题', link: '/guide/theme' },
          { text: '国际化', link: '/guide/i18n' },
          { text: '贡献', link: '/guide/contributing' }
        ],
        sidebar: [
          {
            text: '开始使用',
            items: [
              { text: '安装指南', link: '/guide/installation' },
              { text: '主题配置', link: '/guide/theme' },
              { text: '国际化配置', link: '/guide/i18n' }
            ]
          },
          {
            text: '组件文档',
            items: [
              { text: 'Button', link: '/components/button' },
              { text: 'Input', link: '/components/input' },
              { text: 'Dialog', link: '/components/dialog' }
            ]
          },
          {
            text: '示例',
            items: [
              { text: 'H5 示例', link: '/examples/h5' },
              { text: '小程序示例', link: '/examples/weapp' }
            ]
          },
          {
            text: '社区',
            items: [{ text: '如何贡献', link: '/guide/contributing' }]
          }
        ],
        socialLinks: [{ icon: 'github', link: githubUrl }],
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
          { text: 'Examples', link: '/en/examples/h5' },
          { text: 'Theme', link: '/en/guide/theme' },
          { text: 'I18n', link: '/en/guide/i18n' },
          { text: 'Contributing', link: '/en/guide/contributing' }
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Installation', link: '/en/guide/installation' },
              { text: 'Theme', link: '/en/guide/theme' },
              { text: 'Internationalization', link: '/en/guide/i18n' }
            ]
          },
          {
            text: 'Components',
            items: [
              { text: 'Button', link: '/en/components/button' },
              { text: 'Input', link: '/en/components/input' },
              { text: 'Dialog', link: '/en/components/dialog' }
            ]
          },
          {
            text: 'Examples',
            items: [
              { text: 'H5 Example', link: '/en/examples/h5' },
              { text: 'Mini-program Example', link: '/en/examples/weapp' }
            ]
          },
          {
            text: 'Community',
            items: [{ text: 'Contributing', link: '/en/guide/contributing' }]
          }
        ],
        socialLinks: [{ icon: 'github', link: githubUrl }],
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        darkModeSwitchLabel: 'Appearance',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top'
      }
    }
  }
})