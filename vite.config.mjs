import { defineConfig } from 'weapp-vite/config'
export default defineConfig({
  root: import.meta.dirname,
  build: { minify: false },
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    multiPlatform: { enabled: true, targets: ['weapp'], projectConfigRoot: 'config' },
    autoImportComponents: false,
    vue: { enable: true, template: { nativeSlotContext: true, scopedSlotsRequireProps: true } },
    mcp: { enabled: false, autoStart: false },
  },
})
