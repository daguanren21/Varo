import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: 'esm',
  sourcemap: true,
  deps: { neverBundle: ['../runtime/markdown-parser.mjs'] },
})
