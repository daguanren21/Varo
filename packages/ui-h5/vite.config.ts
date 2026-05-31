import { resolve } from 'node:path'
import { copyFileSync, mkdirSync } from 'node:fs'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.build.json'
    }),
    {
      name: 'copy-style-entry',
      closeBundle() {
        mkdirSync(resolve(__dirname, 'dist'), { recursive: true })
        copyFileSync(resolve(__dirname, 'src/style.css'), resolve(__dirname, 'dist/style.css'))
      }
    }
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: [
        '@varo/hooks',
        '@varo/primitives-core',
        '@varo/primitives-h5',
        '@varo/shared',
        '@varo/theme',
        '@varo/utils',
        'vue'
      ]
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@varo/hooks': resolve(import.meta.dirname, '../hooks/src/index.ts'),
      '@varo/primitives-core': resolve(import.meta.dirname, '../primitives-core/src/index.ts'),
      '@varo/primitives-h5': resolve(import.meta.dirname, '../primitives-h5/src/index.ts'),
      '@varo/shared': resolve(import.meta.dirname, '../shared/src/index.ts'),
      '@varo/theme': resolve(import.meta.dirname, '../theme/src/index.ts'),
      '@varo/utils': resolve(import.meta.dirname, '../utils/src/index.ts')
    }
  },
  test: {
    environment: 'jsdom',
    passWithNoTests: true
  }
})
