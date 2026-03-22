import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const githubUrl = process.env.VITE_GITHUB_URL || 'https://github.com/your-org/varo'
const workspacePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))

export default defineConfig({
  title: 'Varo',
  description: '面向 H5 与小程序封装的 primitives-first Vue 组件体系。',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    resolve: {
      alias: {
        '@varo/shared': workspacePath('../../../packages/shared/src/index.ts'),
        '@varo/theme': workspacePath('../../../packages/theme/src/index.ts'),
        '@varo/primitives-core': workspacePath('../../../packages/primitives-core/src/index.ts'),
        '@varo/primitives-h5': workspacePath('../../../packages/primitives-h5/src/index.ts'),
        '@varo/primitives-weapp': workspacePath('../../../packages/primitives-weapp/src/index.ts'),
        '@varo/ui-h5': workspacePath('../../../packages/ui-h5/src/index.ts'),
        '@varo/ui-weapp': workspacePath('../../../packages/ui-weapp/src/index.ts')
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
          { text: '示例', link: '/examples/' },
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
            items: [{ text: '跨端演示', link: '/examples/' }]
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
          { text: 'Examples', link: '/en/examples/' },
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
            items: [{ text: 'Cross-platform Demo', link: '/en/examples/' }]
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
