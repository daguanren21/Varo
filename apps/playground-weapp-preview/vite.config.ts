import { resolve } from 'node:path'
import { weappWebPlugin } from '@varo/weapp-web/plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { previewScenarios } from './src/protocol.ts'

const root = import.meta.dirname

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    weappWebPlugin({
      nativeBuildRoot: resolve(root, '../playground-weapp/devtools/build/mp-weixin'),
      pages: Object.fromEntries(previewScenarios.map(scenario => [scenario.id, scenario.page])),
    }),
  ],
  server: { host: '127.0.0.1', port: 5182, strictPort: true },
  preview: { host: '127.0.0.1', port: 4182, strictPort: true },
  build: {
    rolldownOptions: {
      input: {
        index: resolve(root, 'index.html'),
        runtime: resolve(root, 'runtime.html'),
      },
    },
  },
  resolve: {
    alias: [
      { find: '@varo-ui/h5/source/style.css', replacement: resolve(root, '../../packages/ui-h5/src/style.css') },
      { find: '@varo-ui/h5/primitives', replacement: resolve(root, '../../packages/ui-h5/src/primitives.ts') },
      { find: '@varo-ui/h5', replacement: resolve(root, '../../packages/ui-h5/src/index.ts') },
      { find: '@varo-ui/headless', replacement: resolve(root, '../../packages/primitives-core/src/index.ts') },
      { find: '@varo/primitives-h5', replacement: resolve(root, '../../packages/primitives-h5/src/index.ts') },
      { find: '@varo-ui/theme', replacement: resolve(root, '../../packages/theme/src/index.ts') },
      { find: '@varo/shared', replacement: resolve(root, '../../packages/shared/src/index.ts') },
      { find: '@varo/utils', replacement: resolve(root, '../../packages/utils/src/index.ts') },
      { find: '@varo/hooks', replacement: resolve(root, '../../packages/hooks/src/index.ts') },
      { find: /^@varo\/weapp-web$/, replacement: resolve(root, '../../packages/weapp-web/src/index.ts') },
      { find: /^@varo\/weapp-web\/plugin$/, replacement: resolve(root, '../../packages/weapp-web/src/plugin/index.ts') },
      { find: /^@varo\/weapp-web\/runtime$/, replacement: resolve(root, '../../packages/weapp-web/src/runtime/index.ts') },
    ],
  },
})
