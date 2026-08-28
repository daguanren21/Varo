import { defineEslintConfig } from 'repoctl/tooling'

export default await defineEslintConfig({
  configs: [
    {
      name: 'varo/realworld-weapp-generated-code',
      ignores: [
        'apps/realworld-weapp/devtools/**',
        'apps/realworld-weapp/dist/**',
        'apps/realworld-weapp/.weapp-vite/**',
        'apps/realworld-weapp/src/commonjs/**',
        'apps/realworld-weapp/src/proto/**',
        'apps/realworld-weapp/src/weichatPb/**',
        'apps/realworld-weapp/src/esptouch-v2/kotlin.js',
        'apps/realworld-weapp/src/esptouch-v2/esptouch-v2.js',
        'apps/realworld-weapp/src/utils/proto-custom.js',
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
      name: 'varo/realworld-weapp-legacy-coercion',
      files: ['apps/realworld-weapp/**/*.{js,ts,vue}'],
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
