import { resolve } from 'node:path'
import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: { 'markdown-parser': 'build/markdown-runtime.ts' },
  outDir: 'runtime',
  format: 'esm',
  fixedExtension: true,
  platform: 'neutral',
  sourcemap: true,
  deps: { alwaysBundle: ['stream-markdown-parser', 'base64-js'] },
  inputOptions: {
    transform: {
      inject: {
        atob: [resolve(import.meta.dirname, 'build/base64.ts'), 'decodeBase64'],
        btoa: [resolve(import.meta.dirname, 'build/base64.ts'), 'encodeBase64'],
      },
    },
  },
})
