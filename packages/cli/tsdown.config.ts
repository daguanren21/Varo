import { defineConfig } from 'tsdown'

export default defineConfig(options => ({
  clean: !options.watch,
  // Load source-only workspace types before bundling the runtime graph.
  dts: { eager: true },
  deps: {
    alwaysBundle: [/^@varo\/registry(?:\/|$)/],
  },
  entry: ['src/index.ts'],
  format: 'esm',
  outDir: 'dist',
  sourcemap: true,
}))
