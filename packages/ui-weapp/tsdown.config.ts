import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    resolver: 'src/resolver.ts',
  },
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
  unbundle: true,
})
