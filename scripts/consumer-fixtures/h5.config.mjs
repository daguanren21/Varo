import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { consumerIsolation } from './isolation.mjs'

const root = import.meta.dirname
const exportsEntry = resolve(root, 'public-exports.ts')

export default defineConfig({
  root,
  plugins: [consumerIsolation(), vue()],
  build: {
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      input: {
        app: resolve(root, 'index.html'),
        ...(existsSync(exportsEntry) ? { exports: exportsEntry } : {}),
      },
      preserveEntrySignatures: 'strict',
    },
  },
})
