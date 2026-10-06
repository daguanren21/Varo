import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
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
      { source: 'styles/varo.css', include: 'app.vue' },
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
