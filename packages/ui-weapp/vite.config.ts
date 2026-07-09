import { resolve } from 'node:path'
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  plugins: [
    weappTailwindcss({
      appType: 'weapp-vite',
      logLevel: 'warn'
    })
  ].flat(),
  resolve: {
    alias: {
      '@varo/hooks': resolve(import.meta.dirname, '../hooks/src/index.ts'),
      '@varo/primitives-core': resolve(import.meta.dirname, '../primitives-core/src/index.ts'),
      '@varo/primitives-weapp': resolve(import.meta.dirname, '../primitives-weapp/src/index.ts'),
      '@varo/shared': resolve(import.meta.dirname, '../shared/src/index.ts'),
      '@varo/theme': resolve(import.meta.dirname, '../theme/src/index.ts'),
      '@varo/utils': resolve(import.meta.dirname, '../utils/src/index.ts')
    }
  },
  test: {
    environment: 'jsdom',
    passWithNoTests: true
  },
  weapp: {
    platform: 'weapp',
    lib: {
      componentJson: 'auto',
      dts: {
        enabled: true,
        mode: 'internal'
      },
      entry: 'src/index.ts',
      outDir: 'dist'
    },
    vue: {
      enable: true
    }
  }
})
