import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/hooks.ts', 'src/parts.ts'],
  format: 'esm',
  outDir: 'dist',
  sourcemap: true
})
