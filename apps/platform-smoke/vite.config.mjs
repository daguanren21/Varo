import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'
import { getProject, repoRoot } from './scripts/project.mjs'

const { profile, consumerRoot } = getProject(process.env.VARO_SMOKE_TARGET)
const styleFiles = readdirSync(resolve(consumerRoot, 'src/styles'))
  .filter(name => name.endsWith('.css'))
  .sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))

export default defineConfig({
  root: consumerRoot,
  define: {
    __VARO_PROFILE__: JSON.stringify(profile.id),
    __VARO_PROFILE_MATURITY__: JSON.stringify(profile.maturity),
  },
  build: {
    minify: 'esbuild',
  },
  esbuild: { keepNames: true },
  oxc: false,
  resolve: {
    alias: {
      '@varo-ui/headless': resolve(repoRoot, 'packages/primitives-core/src/index.ts'),
      '@varo-ui/theme': resolve(repoRoot, 'packages/theme/src'),
      '@varo/hooks': resolve(repoRoot, 'packages/hooks/src/index.ts'),
      '@varo/shared': resolve(repoRoot, 'packages/shared/src/index.ts'),
      '@varo/utils': resolve(repoRoot, 'packages/utils/src/index.ts'),
    },
  },
  weapp: {
    srcRoot: 'src',
    platform: profile.compilerPlatform,
    multiPlatform: {
      enabled: true,
      targets: [profile.compilerPlatform],
      projectConfigRoot: 'config',
    },
    autoImportComponents: false,
    styles: [
      ...styleFiles.map(name => ({ source: `styles/${name}`, include: 'app.vue' })),
      { source: 'styles.css', include: 'app.vue' },
    ],
    tailwindcss: {
      appType: 'weapp-vite',
      cssEntries: [resolve(consumerRoot, 'src/styles.css')],
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
