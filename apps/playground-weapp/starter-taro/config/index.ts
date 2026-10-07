import { resolve } from 'node:path'
import { defineConfig } from '@tarojs/cli'
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'
import { ProgressPlugin } from 'webpack'

const root = resolve(__dirname, '..')
const isWeapp = process.env.TARO_ENV === 'weapp'
const outputRoot = isWeapp ? 'dist/weapp' : 'dist/h5'
const tailwind = {
  appType: 'taro' as const,
  tailwindcssBasedir: root,
  cssEntries: [resolve(root, 'src/styles.css')],
  cssOptions: {
    cssPreflight: false as const,
    rem2rpx: isWeapp,
    cssRemoveActivePseudoClass: isWeapp,
  },
  ignoreCallExpressionIdentifiers: ['cn'],
  customAttributes: { '*': ['className', 'class-name'] },
  logLevel: 'warn' as const,
}

export default defineConfig<'webpack5'>({
  projectName: 'varo-retail-taro-starter',
  framework: 'vue3',
  compiler: { type: 'webpack5', prebundle: { enable: false } },
  sourceRoot: 'src',
  outputRoot,
  designWidth: 750,
  deviceRatio: { 750: 1 },
  cache: { enable: false },
  copy: { patterns: [{ from: 'src/static', to: `${outputRoot}/static` }], options: {} },
  mini: {
    postcss: { pxtransform: { enable: false } },
    webpackChain(chain) {
      chain.plugin('webpackbar').use(ProgressPlugin, [{ activeModules: true }])
      chain.plugin('retail-tailwind').use(WeappTailwindcss, [tailwind])
    },
  },
  h5: {
    publicPath: '/',
    router: { mode: 'hash' },
    devServer: { host: '127.0.0.1', port: 5173, open: false },
    postcss: { pxtransform: { enable: false } },
    webpackChain(chain) {
      chain.plugin('webpackbar').use(ProgressPlugin, [{ activeModules: true }])
      chain.plugin('retail-tailwind').use(WeappTailwindcss, [tailwind])
    },
  },
})
