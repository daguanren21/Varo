import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    passWithNoTests: true
  },
  resolve: {
    alias: {
      '@varo/shared': resolve(__dirname, 'packages/shared/src/index.ts'),
      '@varo/theme': resolve(__dirname, 'packages/theme/src/index.ts'),
      '@varo/primitives-core': resolve(__dirname, 'packages/primitives-core/src/index.ts'),
      '@varo/primitives-h5': resolve(__dirname, 'packages/primitives-h5/src/index.ts'),
      '@varo/primitives-weapp': resolve(__dirname, 'packages/primitives-weapp/src/index.ts'),
      '@varo/ui-h5': resolve(__dirname, 'packages/ui-h5/src/index.ts'),
      '@varo/ui-weapp': resolve(__dirname, 'packages/ui-weapp/src/index.ts')
    }
  }
})
