import { defineStylelintConfig } from 'repoctl/tooling'

export default await defineStylelintConfig({
  options: {
    ignoreFiles: ['**/dist/**', '**/devtools/**'],
    rules: {
      'declaration-block-single-line-max-declarations': null,
    },
  },
})
