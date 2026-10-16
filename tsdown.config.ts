import { defineConfig } from 'tsdown'

export default defineConfig(options => ({
  clean: !options.watch,
  dts: true,
  deps: {
    alwaysBundle: [/^@varo\/(?:hooks|primitives-h5|registry|shared|utils)(?:\/|$)/],
  },
  entry: ['src/index.ts'],
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
}))
