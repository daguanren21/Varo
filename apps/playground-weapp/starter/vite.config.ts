import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
const registryStyles = readdirSync(resolve(root, 'src/styles'))
  .filter(name => name.endsWith('.css'))
  .sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))
const isProductionBuild = process.argv.slice(2).includes('build')

export default defineConfig({
  build: {
    outDir: isProductionBuild ? 'devtools/build/mp-weixin' : 'dist/dev/mp-weixin',
    minify: 'esbuild',
  },
  esbuild: { keepNames: true },
  oxc: false,
  weapp: {
    autoImportComponents: false,
    srcRoot: 'src',
    platform: 'weapp',
    styles: [
      { source: 'styles.css', include: 'app.vue' },
      ...registryStyles.map(name => ({ source: `styles/${name}`, include: 'app.vue' })),
    ],
    tailwindcss: {
      appType: 'weapp-vite',
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: {
        cssPreflight: false,
        rem2rpx: true,
        cssRemoveActivePseudoClass: true,
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      logLevel: 'warn',
    },
    mcp: { enabled: false, autoStart: false },
    vue: {
      enable: true,
      template: {
        htmlTagToWxml: true,
        htmlTagToWxmlTagClass: true,
        scopedSlotsRequireProps: true,
      },
    },
  },
})
