import { defineStylelintConfig } from 'repoctl/tooling'

export default await defineStylelintConfig({
  options: {
    ignoreFiles: [
      '**/dist/**',
      '**/devtools/**',
      'apps/realworld-weapp/src/**/*.scss',
      'apps/realworld-weapp/src/**/*.vue',
      'apps/realworld-weapp/src/assets/**/iconfont.css',
    ],
    overrides: [
      {
        files: [
          'apps/playground-weapp-preview/src/runtime/*.css',
          'packages/weapp-web/src/runtime/*.css',
        ],
        rules: {
          'selector-type-no-unknown': [true, {
            ignoreTypes: ['wx-page', 'wx-view', 'wx-text', 'wx-button', 'wx-input', 'wx-textarea', 'wx-label', 'wx-image', 'wx-scroll-view', 'wx-rich-text', 'wx-map', 'wx-wechat-robot-chat'],
          }],
        },
      },
    ],
    rules: {
      'declaration-block-single-line-max-declarations': null,
      'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    },

  },
})
