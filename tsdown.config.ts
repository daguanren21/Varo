import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: true,
  deps: {
    alwaysBundle: [/^@varo\/(?:hooks|primitives-h5|primitives-weapp|shared|utils)(?:\/|$)/],
  },
  entry: ['src/index.ts'],
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
})
