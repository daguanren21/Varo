import { defineStylelintConfig } from 'repoctl/tooling'
import projections from './scripts/registry-projections.json' with { type: 'json' }

export default await defineStylelintConfig({
  options: {
    ignoreFiles: [
      ...Object.values(projections.owners).flatMap(files => Object.keys(files)),
      '**/dist/**',
      '**/devtools/**',
      'apps/realworld-weapp/src/**/*.scss',
      'apps/realworld-weapp/src/**/*.vue',
      'apps/realworld-weapp/src/assets/**/iconfont.css',
    ],
    overrides: [
      {
        // Keep the authored negation specificity; Button intentionally uses complex notation.
        files: [
          'registry/themes/components/checkbox/h5.css',
          'registry/themes/components/checkbox/weapp-vite.css',
          'registry/themes/components/switch/h5.css',
        ],
        rules: {
          'selector-not-notation': 'simple',
        },
      },
      {
        files: [
          'apps/playground-weapp-preview/src/runtime/*.css',
          'packages/weapp-web/src/runtime/*.css',
        ],
        rules: {
          'selector-type-no-unknown': [true, {
            ignoreTypes: ['wx-page', 'wx-view', 'wx-text', 'wx-button', 'wx-input', 'wx-textarea', 'wx-label', 'wx-image', 'wx-canvas', 'wx-scroll-view', 'wx-rich-text', 'wx-map', 'wx-wechat-robot-chat'],
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
