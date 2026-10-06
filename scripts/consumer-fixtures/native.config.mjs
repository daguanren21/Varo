import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'
import { consumerIsolation } from './isolation.mjs'

const root = import.meta.dirname
const sourceInstall = process.env.VARO_CONSUMER_DELIVERY === 'source'
const styleFiles = sourceInstall
  ? readdirSync(resolve(root, 'src/styles')).filter(name => name.endsWith('.css')).sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))
  : []

// The common platform-smoke compiler setup, without its workspace-only aliases.
export default defineConfig({
  root,
  plugins: [consumerIsolation()],
  define: {
    __VARO_PROFILE__: JSON.stringify('weapp'),
    __VARO_PROFILE_MATURITY__: JSON.stringify('stable'),
  },
  build: { minify: 'esbuild' },
  esbuild: { keepNames: true },
  oxc: false,
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    multiPlatform: { enabled: true, targets: ['weapp'], projectConfigRoot: 'config' },
    autoImportComponents: false,
    styles: [
      ...styleFiles.map(name => ({ source: `styles/${name}`, include: 'app.vue' })),
      ...(sourceInstall ? [] : [{ source: 'package.css', include: 'app.vue' }]),
      { source: 'styles.css', include: 'app.vue' },
    ],
    tailwindcss: {
      appType: 'weapp-vite',
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: { cssPreflight: false, rem2rpx: true, cssRemoveActivePseudoClass: true },
      ignoreCallExpressionIdentifiers: ['cn'],
      logLevel: 'warn',
    },
    vue: {
      enable: true,
      template: { htmlTagToWxml: true, htmlTagToWxmlTagClass: true, scopedSlotsRequireProps: true },
    },
    mcp: { enabled: false, autoStart: false },
  },
})
