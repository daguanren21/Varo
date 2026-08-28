import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  deps: {
    alwaysBundle: [/^@varo\/(?:hooks|primitives-weapp|shared|utils)(?:\/|$)/],
  },
  entry: {
    index: 'src/index.ts',
    primitives: 'src/primitives.ts',
  },
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
  unbundle: true,
})
