import { defineEslintConfig } from 'repoctl/tooling'

export default await defineEslintConfig({
  configs: [
    {
      name: 'varo/compatibility',
      rules: {
        'node/prefer-global/process': 'off',
        'style/max-statements-per-line': 'off',
      },
    },
  ],
})
