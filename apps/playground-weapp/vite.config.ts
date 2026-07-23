import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  resolve: {
    alias: {
      '@varo/hooks': resolve(import.meta.dirname, '../../packages/hooks/src/index.ts'),
      '@varo/primitives-core': resolve(import.meta.dirname, '../../packages/primitives-core/src/index.ts'),
      '@varo/primitives-weapp': resolve(import.meta.dirname, '../../packages/primitives-weapp/src/index.ts'),
      '@varo/shared': resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
      '@varo/theme': resolve(import.meta.dirname, '../../packages/theme/src/index.ts'),
      '@varo/utils': resolve(import.meta.dirname, '../../packages/utils/src/index.ts'),
      '@varo/ui-weapp': resolve(import.meta.dirname, '../../packages/ui-weapp/src/index.ts')
    }
  },
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    vue: {
      enable: true,
      template: {
        htmlTagToWxml: true,
        htmlTagToWxmlTagClass: true
      }
    }
  }
})
