# Wevu Registry 模式

CLI 把适用于 Wevu 7 小程序的组件源码复制到项目中。安装后直接从 `src/components/ui/*` 导入并按业务修改。

## 一次性接入 Wevu 7 工程

以下全局样式与 Tailwind 配置每个工程只需完成一次，不需要在每个组件页面重复配置。

### 安装构建与样式依赖

```bash
pnpm add wevu clsx @weapp-tailwindcss/merge
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
```

CLI 会递归复制 Registry 文件并输出 npm 的 `Dependencies:` 和 `Dev dependencies:`，但不会修改 `package.json` 或执行包管理器。每次运行 `add` 后，都要使用 `pnpm add` / `pnpm add -D` 安装输出中尚未存在的全部依赖；不同组件还可能报告 `@varo-ui/headless`、`@varo-ui/weapp` 等依赖。

### 创建 Tailwind 样式入口

在 `src/styles.css` 中使用与 Varo 小程序 playground 相同的 Tailwind v4 入口：

```css
@layer theme, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css';

@layer base {
  button {
    line-height: inherit;
  }

  button::after {
    border: 0;
  }
}
```

### 注册托管全局样式

在 `vite.config.ts` 的 `weapp` 配置中注册 Tailwind 入口和 Registry 安装的主题文件，并使用托管 Tailwind 配置：

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    styles: [
      { source: 'styles.css', include: 'app.vue' },
      { source: 'styles/varo.css', include: 'app.vue' },
    ],
    tailwindcss: {
      appType: 'weapp-vite',
      cssEntries: [resolve(root, 'src/styles.css')],
      cssOptions: {
        cssPreflight: false,
        rem2rpx: true,
        cssRemoveActivePseudoClass: true,
      },
      ignoreCallExpressionIdentifiers: ['cn'],
      logLevel: 'warn',
    },
  },
})
```

`styles` 中的 `source` 相对于 `srcRoot`。组件依赖的 `themes/base` 会把 `src/styles/varo.css` 安装到业务工程；`weapp.styles` 统一把两个样式入口注入 `app.vue`，不要再在各页面或组件中手动重复导入。

## 安装组件

```bash
pnpm dlx @varo-ui/cli add --target weapp button form toast
```

把命令末尾的名称替换为需要的组件。安装 Block 或 Agent UI：

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

CLI 默认不覆盖已有文件。确认要替换本地版本时使用 `--force`：

```bash
pnpm dlx @varo-ui/cli add --target weapp --force button
```

## 使用

```vue
<script setup lang="ts">
import { shallowRef } from 'wevu'
import VButton from '@/components/ui/v-button.vue'

const loading = shallowRef(false)
</script>

<template>
  <VButton :loading="loading" @click="loading = true">
    保存
  </VButton>
</template>
```

组件源码、依赖工具和主题文件都位于业务项目中，可以直接修改。
