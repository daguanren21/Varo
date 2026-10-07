import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const root = dirname(fileURLToPath(import.meta.url))
// This pinned official plugin publishes a CommonJS exports.default, not an ESM default.
const { default: uni } = createRequire(import.meta.url)('@dcloudio/vite-plugin-uni')
const isWeixin = process.env.UNI_PLATFORM === 'mp-weixin'

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      appType: 'uni-app',
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: {
        cssPreflight: false,
        rem2rpx: isWeixin,
        cssRemoveActivePseudoClass: isWeixin,
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      customAttributes: { '*': ['className', 'class-name'] },
      logLevel: 'warn',
    }),
  ],
  server: { host: '127.0.0.1' },
})
