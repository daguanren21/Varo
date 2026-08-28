import { defineEslintConfig } from 'repoctl/tooling'

export default await defineEslintConfig({
  configs: [
    {
      name: 'varo/aedmap-weapp-generated-code',
      ignores: [
        'apps/aedmap-weapp/devtools/**',
        'apps/aedmap-weapp/dist/**',
        'apps/aedmap-weapp/.weapp-vite/**',
        'apps/aedmap-weapp/src/commonjs/**',
        'apps/aedmap-weapp/src/proto/**',
        'apps/aedmap-weapp/src/weichatPb/**',
        'apps/aedmap-weapp/src/esptouch-v2/kotlin.js',
        'apps/aedmap-weapp/src/esptouch-v2/esptouch-v2.js',
        'apps/aedmap-weapp/src/utils/proto-custom.js',
      ],
    },
    {
      name: 'varo/compatibility',
      rules: {
        'node/prefer-global/process': 'off',
        'style/max-statements-per-line': 'off',
      },
    },
    {
      name: 'varo/aedmap-weapp-legacy-coercion',
      files: ['apps/aedmap-weapp/**/*.{js,ts,vue}'],
      languageOptions: {
        globals: {
          wx: 'readonly',
        },
      },
      rules: {
        'eqeqeq': 'off',
        'prefer-const': 'warn',
        'ts/no-redeclare': 'off',
        'ts/no-unused-vars': 'warn',
        'vue/eqeqeq': 'off',
      },
    },
  ],
})
