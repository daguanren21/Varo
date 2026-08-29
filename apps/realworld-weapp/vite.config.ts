import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'
import { renderRealworldThemeCss } from './src/theme.ts'

const root = import.meta.dirname
const appStylePath = resolve(root, 'src/app.scss')
const themeMarker = '/* @varo-theme */'

function realworldThemePlugin(): Plugin {
  return {
    name: 'varo:realworld-theme',
    enforce: 'pre',
    transform(source, id) {
      if (id.split('?')[0] !== appStylePath) {
        return
      }
      if (!source.includes(themeMarker)) {
        throw new Error(`Missing ${themeMarker} in src/app.scss`)
      }
      return {
        code: source.replace(themeMarker, renderRealworldThemeCss()),
        map: null,
      }
    },
  }
}

function realworldGlobalStylesPlugin(): Plugin {
  return {
    name: 'varo:realworld-global-styles',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const appStyle = Object.values(bundle)
          .find(output => output.type === 'asset' && output.fileName === 'app.wxss')
        const sharedStyle = Object.values(bundle)
          .find(output => output.type === 'asset' && output.fileName === 'styles.wxss')

        if (!appStyle || appStyle.type !== 'asset' || !sharedStyle) {
          throw new Error('Expected app.wxss and styles.wxss assets')
        }

        const appSource = typeof appStyle.source === 'string'
          ? appStyle.source
          : new TextDecoder().decode(appStyle.source)
        const sharedSource = typeof sharedStyle.source === 'string'
          ? sharedStyle.source
          : new TextDecoder().decode(sharedStyle.source)

        sharedStyle.source = sharedSource
          .replace(/^@import\s+["']\.\/assets\/(?:fonts|jousingFonts)\/iconfont\.css["'];\s*$/gm, '')
          .replaceAll('../../static/fonts/', './static/fonts/')
        appStyle.source = `@import "./styles.wxss";\n${appSource}`
      },
    },
  }
}

export default defineConfig({
  plugins: [
    realworldThemePlugin(),
    weappTailwindcss({
      appType: 'weapp-vite',
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: {
        cssPreflight: false,
        rem2rpx: true,
        px2rpx: {
          platform: 'weapp',
          designWidth: 750,
          selectorBlackList: [/^page$/, /\.varo-/],
        },
        cssRemoveActivePseudoClass: true,
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      logLevel: 'warn',
    }),
    realworldGlobalStylesPlugin(),
  ],
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
    copy: {
      include: ['static/fonts/**/*'],
    },
    styles: {
      source: 'styles.css',
      inject: false,
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
