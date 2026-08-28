import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: true,
    }),
    {
      name: 'copy-style-entry',
      closeBundle() {
        mkdirSync(resolve(import.meta.dirname, 'dist'), { recursive: true })
        copyFileSync(resolve(import.meta.dirname, 'src/style.css'), resolve(import.meta.dirname, 'dist/style.css'))
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        primitives: resolve(import.meta.dirname, 'src/primitives.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        '@varo-ui/headless',
        '@varo-ui/theme',
        'vue',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: resolve(import.meta.dirname, 'src'),
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@varo/hooks': resolve(import.meta.dirname, '../hooks/src/index.ts'),
      '@varo-ui/headless': resolve(import.meta.dirname, '../primitives-core/src/index.ts'),
      '@varo/primitives-h5': resolve(import.meta.dirname, '../primitives-h5/src/index.ts'),
      '@varo/shared': resolve(import.meta.dirname, '../shared/src/index.ts'),
      '@varo-ui/theme': resolve(import.meta.dirname, '../theme/src/index.ts'),
      '@varo/utils': resolve(import.meta.dirname, '../utils/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
  },
})
