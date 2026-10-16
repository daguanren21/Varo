import { defineConfig } from 'tsdown'

export default defineConfig(options => ({
  clean: !options.watch,
  dts: true,
  entry: {
    resolver: 'src/resolver.ts',
  },
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
  unbundle: true,
}))
