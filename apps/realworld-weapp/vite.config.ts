import type { Plugin } from 'vite'
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { posix, relative, resolve } from 'node:path'
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'
import { renderRealworldThemeCss } from './src/theme.ts'

const root = import.meta.dirname
const appStylePath = resolve(root, 'src/app.scss')
const themeMarker = '/* @varo-theme */'
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
const postWriteLocalizedChunkFiles = new Map([
  ['check.js', 'managePages/_chunks/check.js'],
  ['checkShanghai.js', 'managePages/_chunks/checkShanghai.js'],
  ['detail.js', 'managePages/_chunks/detail.js'],
  ['highSearch.js', 'managePages/_chunks/highSearch.js'],
  ['module.js', 'managePages/_chunks/module.js'],
  ['repair.js', 'managePages/_chunks/repair.js'],
])

async function collectJavaScriptFiles(directory: string, files: string[] = []): Promise<string[]> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      await collectJavaScriptFiles(path, files)
    }
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(path)
    }
  }
  return files
}

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
    writeBundle: {
      order: 'post',
      async handler(options) {
        if (!options.dir) {
          throw new Error('Expected an output directory for localized chunks')
        }
        const outputDirectory = resolve(options.dir)
        for (const [originalFileName, localizedFileName] of postWriteLocalizedChunkFiles) {
          const originalPath = resolve(outputDirectory, originalFileName)
          const localizedPath = resolve(outputDirectory, localizedFileName)
          await mkdir(resolve(localizedPath, '..'), { recursive: true })
          try {
            await rename(originalPath, localizedPath)
          }
          catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
              throw error
            }
          }
        }

        const originalFileByLocalizedFile = new Map(
          Array.from(postWriteLocalizedChunkFiles, ([original, localized]) => [localized, original]),
        )
        for (const file of await collectJavaScriptFiles(outputDirectory)) {
          const localizedImporter = relative(outputDirectory, file).split('\\').join('/')
          const originalImporter = originalFileByLocalizedFile.get(localizedImporter) ?? localizedImporter
          const source = await readFile(file, 'utf8')
          const rewritten = source.replace(
            /require\((['"])(\.[^'"]+)\1\)/g,
            (_match, quote: string, specifier: string) => {
              const originalTarget = posix.normalize(posix.join(posix.dirname(originalImporter), specifier))
              const localizedTarget = postWriteLocalizedChunkFiles.get(originalTarget) ?? originalTarget
              let relativeTarget = posix.relative(posix.dirname(localizedImporter), localizedTarget)
              if (!relativeTarget.startsWith('.')) {
                relativeTarget = `./${relativeTarget}`
              }
              return `require(${quote}${relativeTarget}${quote})`
            },
          )
          if (rewritten !== source) {
            await writeFile(file, rewritten)
          }
        }
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
