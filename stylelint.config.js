import { defineStylelintConfig } from 'repoctl/tooling'

export default await defineStylelintConfig({
  options: {
    ignoreFiles: [
      '**/dist/**',
      '**/devtools/**',
      'apps/aedmap-weapp/src/**/*.scss',
      'apps/aedmap-weapp/src/**/*.vue',
      'apps/aedmap-weapp/src/assets/**/iconfont.css',
    ],
    rules: {
      'declaration-block-single-line-max-declarations': null,
    },
  },
})
