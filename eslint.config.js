import { defineEslintConfig } from 'repoctl/tooling'
import projections from './scripts/registry-projections.json' with { type: 'json' }

export default await defineEslintConfig({
  configs: [
    {
      name: 'varo/registry-projections',
      ignores: Object.values(projections.owners).flatMap(files => Object.keys(files)),
    },
    {
      name: 'varo/generated-code',
      ignores: [
        'packages/cli/registry/**',
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
      name: 'varo/native-positional-markdown',
      files: [
        'registry/components/agent-ui/{AgentMarkdown,AgentMarkdownNode,AgentCodeBlock}.vue',
      ],
      rules: {
        // Native wx:key resolves item fields; these stateless AST/code rows intentionally use positions.
        'vue/valid-v-for': 'off',
      },
    },
    {
      name: 'varo/native-event-names',
      files: [
        'apps/playground-weapp/src/**/*.vue',
        'registry/blocks/**/weapp-vite.vue',
        'registry/blocks/**/*.weapp-vite.vue',
        'registry/components/**/weapp-vite.vue',
        'registry/components/**/*.weapp-vite.vue',
        'registry/components/**/v-*.vue',
        'registry/components/agent-ui/Agent*.vue',
      ],
      rules: {
        // Native event names are exact; Vue hyphenation rewrites break emitted-name/listener pairs.
        'vue/v-on-event-hyphenation': 'off',
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
