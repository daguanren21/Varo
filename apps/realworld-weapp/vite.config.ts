import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname

export default defineConfig({
  build: {
    outDir: process.env.VARO_WEAPP_OUTPUT === 'development' ? 'dist/dev/mp-weixin' : 'devtools/build/mp-weixin',
    minify: 'esbuild',
  },
  esbuild: {
    keepNames: true,
  },
  oxc: false,
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      'src': resolve(root, 'src'),
    },
  },
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    tailwindcss: {
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: {
        rem2rpx: true,
        cssRemoveActivePseudoClass: true,
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      logLevel: 'warn',
    },
    styles: {
      source: 'styles.css',
      include: ['app.vue'],
    },
    autoImportComponents: {
      globs: ['components/ui/**/*.vue', 'components/aed/**/*.vue'],
      typedComponents: true,
      vueComponents: true,
    },
    chunks: {
      sharedStrategy: 'duplicate',
      duplicateWarningBytes: 256 * 1024,
    },
    forwardConsole: {
      enabled: true,
      logLevels: ['log', 'info', 'warn', 'error'],
      unhandledErrors: true,
    },
    vue: {
      enable: true,
      template: {
        htmlTagToWxml: true,
        htmlTagToWxmlTagClass: true,
      },
    },
  },
})
