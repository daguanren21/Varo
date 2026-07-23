import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = import.meta.dirname

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true
  },
  resolve: {
    alias: [
      {
        find: '@varo/ui-h5/source/style.css',
        replacement: resolve(root, '../../packages/ui-h5/src/style.css')
      },
      {
        find: '@varo/hooks',
        replacement: resolve(root, '../../packages/hooks/src/index.ts')
      },
      {
        find: '@varo/primitives-core',
        replacement: resolve(root, '../../packages/primitives-core/src/index.ts')
      },
      {
        find: '@varo/primitives-h5',
        replacement: resolve(root, '../../packages/primitives-h5/src/index.ts')
      },
      {
        find: '@varo/shared',
        replacement: resolve(root, '../../packages/shared/src/index.ts')
      },
      {
        find: '@varo/theme',
        replacement: resolve(root, '../../packages/theme/src/index.ts')
      },
      {
        find: '@varo/utils',
        replacement: resolve(root, '../../packages/utils/src/index.ts')
      },
      {
        find: '@varo/ui-h5',
        replacement: resolve(root, '../../packages/ui-h5/src/index.ts')
      }
    ]
  }
})
