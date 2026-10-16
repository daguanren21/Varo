import { defineConfig } from 'tsdown'

export default defineConfig(options => ({
  clean: !options.watch,
  dts: true,
  entry: ['src/index.ts', 'src/hooks.ts', 'src/parts.ts'],
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
}))
