import type { WeappCompilerPlugin } from 'weapp-vite/config'
import { createHash } from 'node:crypto'
import { readdirSync, realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { minifySync, transformWithOxc } from 'vite'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
const registryStyles = readdirSync(resolve(root, 'src/styles'))
  .filter(name => name.endsWith('.css'))
  .sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))
const isTest = process.env.VITEST === 'true'
const isProductionBuild = process.argv.slice(2).includes('build')
const nativeBuildTarget = 'es2018'
const weappJsonBlockTestPlugin = {
  name: 'varo-weapp-json-block-test',
  enforce: 'post' as const,
  transform(code: string, id: string) {
    if (!id.includes('vue&type=json')) { return }
    return {
      code: `export default ${code.trim()}`,
      map: null,
    }
  },
}

const devToolsSyntaxPlugin: WeappCompilerPlugin = {
  name: 'varo-weapp-devtools-syntax',
  phase: 'output',
  create({ isDev, resolvedConfig }) {
    if (isDev || resolvedConfig?.build.watch) { return {} }
    return {
      async transformJavaScript({ fileName, code }) {
        if (!/\?\?|\?\./.test(code)) { return null }
        // weapp-vite injects request globals after Vite's syntax lowering.
        const lowered = await transformWithOxc(code, fileName, {
          target: nativeBuildTarget,
          sourcemap: false,
          tsconfig: false,
        })
        const compact = minifySync(fileName, lowered.code, { compress: false, mangle: false })
        if (compact.errors.length) {
          throw new Error(`Failed to compact DevTools JavaScript ${fileName}: ${compact.errors.map(error => error.message).join('\n')}`)
        }
        return { code: compact.code }
      },
    }
  },
}

const projectIdentity = createHash('sha256').update(resolve(realpathSync(root), 'devtools/build')).digest('hex')

export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VARO_ROBOT_CHAT_ENABLED': JSON.stringify(process.env.WEAPP_ROBOT_CHAT === '1'),
    'import.meta.env.VARO_E2E_PROJECT_ID': JSON.stringify(projectIdentity),
  },
  plugins: isTest
    ? [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: tag => tag === 'scroll-view' || tag === 'rich-text',
            },
          },
        }),
        weappJsonBlockTestPlugin,
      ]
    : [],
  build: {
    // Vite owns syntax lowering; project.config.json disables the DevTools JS passes.
    target: nativeBuildTarget,
    outDir: mode === 'browser-preview'
      ? 'dist/browser/mp-weixin'
      : isProductionBuild ? 'devtools/build/mp-weixin' : 'dist/dev/mp-weixin',
    minify: 'esbuild',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            ...(process.env.WEAPP_A2UI_DEMO === '1'
              ? [{
                  name: 'pages/agent-a2ui/core',
                  test: /[/\\]node_modules[/\\]@a2ui[/\\]web_core[/\\]/,
                  priority: 1,
                  minShareCount: 1,
                  includeDependenciesRecursively: true,
                }]
              : []),
            {
              // Claim virtual/resolved compiler helpers before a demo's common group absorbs their closure.
              name: 'weapp-vendors/compiler-helpers',
              test: /@oxc-project(?:\/|\+)runtime(?:@[^/]+)?\/(?:src\/)?helpers\//,
              priority: 1,
              minShareCount: 1,
              includeDependenciesRecursively: true,
            },
            {
              // Main-owned native UI entries cannot synchronously load a Block subpackage's helpers.
              name: 'weapp-vendors/ui-helpers',
              test: /\/src\/components\/ui\/[^/?]+\.ts(?:\?|$)/,
              priority: 1,
              minShareCount: 1,
            },
          ],
        },
        assetFileNames: asset => asset.originalFileNames.some(path => path.includes('src/docs-preview/assets/'))
          ? 'docs-preview/assets/[name]-[hash][extname]'
          : '[name]-[hash][extname]',
      },
    },
  },
  esbuild: {
    keepNames: !isProductionBuild,
  },
  oxc: false,
  resolve: {
    alias: {
      ...(isTest ? { wevu: resolve(root, 'test/wevu.ts') } : {}),
      '@varo-ui/ai': resolve(import.meta.dirname, '../../packages/agent-core/src/index.ts'),
      '@varo/hooks': resolve(import.meta.dirname, '../../packages/hooks/src/index.ts'),
      '@varo-ui/headless': resolve(import.meta.dirname, '../../packages/primitives-core/src/index.ts'),
      '@varo/shared': resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
      '@varo-ui/theme': resolve(import.meta.dirname, '../../packages/theme/src'),
      '@varo/utils': resolve(import.meta.dirname, '../../packages/utils/src/index.ts'),
    },
  },
  weapp: {
    autoImportComponents: false,
    srcRoot: 'src',
    platform: 'weapp',
    compilerPlugins: !isTest && isProductionBuild && mode !== 'browser-preview' ? [devToolsSyntaxPlugin] : undefined,
    appPrelude: {
      webRuntime: {
        enabled: true,
        networkDefaults: { request: { enableChunked: true } },
      },
    },
    chunks: {
      // Shared image URL modules belong with their main-package assets, not a demo's common chunk.
      sharedOverrides: [{ test: 'assets/retail/*.jpg', mode: 'path' }],
    },
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
    forwardConsole: {
      enabled: true,
      logLevels: ['log', 'info', 'warn', 'error'],
      unhandledErrors: true,
    },
    mcp: {
      enabled: true,
      autoStart: true,
    },
    vue: {
      enable: true,
      template: {
        htmlTagToWxml: true,
        htmlTagToWxmlTagClass: true,
        scopedSlotsRequireProps: true,
        nativeSlotContext: true,
      },
    },
  },
}))
