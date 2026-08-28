import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
const isTest = process.env.VITEST === 'true'
const isProductionBuild = process.argv.slice(2).includes('build')
const weappJsonBlockTestPlugin = {
  name: 'varo-weapp-json-block-test',
  enforce: 'post' as const,
  transform(code: string, id: string) {
    if (!id.includes('vue&type=json')) { return }
    return {
      code: `export default ${code.trim()}`,
      map: null,
    }
  },
}

export default defineConfig({
  plugins: isTest
    ? [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: tag => tag === 'scroll-view',
            },
          },
        }),
        weappJsonBlockTestPlugin,
      ]
    : [
        weappTailwindcss({
          appType: 'weapp-vite',
          cssEntries: [resolve(root, 'src/styles.css')],
          cssOptions: {
            rem2rpx: true,
            cssRemoveActivePseudoClass: true,
          },
          ignoreCallExpressionIdentifiers: ['cn'],
          logLevel: 'warn',
        }),
      ],
  build: {
    outDir: isProductionBuild ? 'devtools/build/mp-weixin' : 'dist/dev/mp-weixin',
    minify: 'esbuild',
  },
  esbuild: {
    keepNames: true,
  },
  oxc: false,
  resolve: {
    alias: {
      ...(isTest ? { wevu: 'vue' } : {}),
      '@varo-ui/weapp/source/style.css': resolve(root, '../../packages/ui-weapp/src/style.css'),
      '@varo-ui/weapp/primitives': resolve(root, '../../packages/ui-weapp/src/primitives.ts'),
      '@varo-ui/ai': resolve(import.meta.dirname, '../../packages/agent-core/src/index.ts'),
      '@varo/hooks': resolve(import.meta.dirname, '../../packages/hooks/src/index.ts'),
      '@varo-ui/headless': resolve(import.meta.dirname, '../../packages/primitives-core/src/index.ts'),
      '@varo/primitives-weapp': resolve(import.meta.dirname, '../../packages/primitives-weapp/src/index.ts'),
      '@varo/shared': resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
      '@varo-ui/theme': resolve(import.meta.dirname, '../../packages/theme/src/index.ts'),
      '@varo/utils': resolve(import.meta.dirname, '../../packages/utils/src/index.ts'),
      '@varo-ui/weapp': resolve(import.meta.dirname, '../../packages/ui-weapp/src/index.ts'),
    },
  },
  weapp: {
    autoImportComponents: false,
    srcRoot: 'src',
    platform: 'weapp',
    forwardConsole: {
      enabled: true,
      logLevels: ['log', 'info', 'warn', 'error'],
      unhandledErrors: true,
    },
    mcp: {
      enabled: true,
      autoStart: true,
    },
    vue: {
      enable: true,
      template: {
        htmlTagToWxml: true,
        htmlTagToWxmlTagClass: true,
      },
    },
  },
})
