import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: ['vite'],
    dts: {
      neverBundle: ['vite'],
    },
  },
  dts: true,
  entry: ['src/index.ts', 'src/weapp.ts', 'src/weapp-vite.ts'],
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
})
