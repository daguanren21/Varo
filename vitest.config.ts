import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    passWithNoTests: true
  },
  resolve: {
    alias: {
      '@varo/shared': resolve(__dirname, 'packages/shared/src/index.ts'),
      '@varo/utils': resolve(__dirname, 'packages/utils/src/index.ts'),
      '@varo/theme': resolve(__dirname, 'packages/theme/src/index.ts'),
      '@varo/hooks': resolve(__dirname, 'packages/hooks/src/index.ts'),
      '@varo/primitives-core': resolve(__dirname, 'packages/primitives-core/src/index.ts'),
      '@varo/primitives-h5': resolve(__dirname, 'packages/primitives-h5/src/index.ts'),
      '@varo/primitives-weapp': resolve(__dirname, 'packages/primitives-weapp/src/index.ts'),
      '@varo/ui-h5': resolve(__dirname, 'packages/ui-h5/src/index.ts'),
      '@varo/ui-weapp': resolve(__dirname, 'packages/ui-weapp/src/index.ts')
    }
  }
})
