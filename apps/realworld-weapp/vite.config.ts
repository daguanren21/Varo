import type { Plugin } from 'vite'
import { readFile } from 'node:fs/promises'
import { posix, resolve } from 'node:path'
import { createVaroWeappThemePlugin } from '@varo-ui/theme/weapp-vite'
import { defineConfig } from 'weapp-vite/config'
import { realworldTheme } from './src/theme.ts'

const root = import.meta.dirname
const appStylePath = resolve(root, 'src/app.scss')
const iconFontStylePaths = [
  resolve(root, 'src/assets/fonts/iconfont.css'),
  resolve(root, 'src/assets/jousingFonts/iconfont.css'),
]
const localizedChunkFiles = new Map([
  ['ascriptionInfo.js', 'improvePages/_chunks/ascriptionInfo.js'],
  ['basicInfo.js', 'improvePages/_chunks/basicInfo.js'],
  ['deployInfo.js', 'improvePages/_chunks/deployInfo.js'],
  ['openInfo.js', 'improvePages/_chunks/openInfo.js'],
  ['partsInfo.js', 'improvePages/_chunks/partsInfo.js'],
])

function realworldGlobalStylesPlugin(): Plugin {
  return {
    name: 'varo:realworld-global-styles',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      async handler(_options, bundle) {
        const originalFileNames = new Map<object, string>()
        for (const output of Object.values(bundle)) {
          originalFileNames.set(output, output.fileName)
        }
        for (const [originalFileName, localizedFileName] of localizedChunkFiles) {
          const output = bundle[originalFileName]
          if (!output || output.type !== 'chunk') {
            continue
          }
          output.fileName = localizedFileName
        }
        for (const output of Object.values(bundle)) {
          if (output.type !== 'chunk') {
            continue
          }
          const originalImporter = originalFileNames.get(output) ?? output.fileName
          output.code = output.code.replace(
            /require\((['"])(\.[^'"]+)\1\)/g,
            (_match, quote: string, specifier: string) => {
              const originalTarget = posix.normalize(posix.join(posix.dirname(originalImporter), specifier))
              const localizedTarget = localizedChunkFiles.get(originalTarget) ?? originalTarget
              let relativeTarget = posix.relative(posix.dirname(output.fileName), localizedTarget)
              if (!relativeTarget.startsWith('.')) {
                relativeTarget = `./${relativeTarget}`
              }
              return `require(${quote}${relativeTarget}${quote})`
            },
          )
          output.imports = output.imports.map(fileName => localizedChunkFiles.get(fileName) ?? fileName)
          output.dynamicImports = output.dynamicImports.map(fileName => localizedChunkFiles.get(fileName) ?? fileName)
        }
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

        const iconFontCss = (await Promise.all(
          iconFontStylePaths.map(path => readFile(path, 'utf8')),
        ))
          .join('\n')
          .replaceAll('../../static/fonts/', './static/fonts/')
          .replace(/(\d+(?:\.\d+)?)px\b/g, '$1rpx')

        sharedStyle.source = `${sharedSource}\n${iconFontCss}`
        appStyle.source = `@import "./styles.wxss";\n${appSource}`
      },
    },
  }
}

export default defineConfig({
  plugins: [
    createVaroWeappThemePlugin({
      appStyle: appStylePath,
      theme: realworldTheme,
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
    tailwindcss: {
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
    },
    copy: {
      include: ['static/fonts/*.woff2'],
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
