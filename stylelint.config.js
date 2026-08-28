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
    rules: {
      'declaration-block-single-line-max-declarations': null,
    },
  },
})
