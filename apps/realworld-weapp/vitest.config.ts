import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      'src': resolve(import.meta.dirname, 'src'),
      '@varo-ui/theme': resolve(import.meta.dirname, '../../packages/theme/src'),
    },
  },
})
