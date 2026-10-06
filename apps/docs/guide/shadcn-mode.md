# Wevu Registry 模式

CLI 把目标 profile 准入的原生 Wevu 组件源码复制到项目中。安装后直接从 `src/components/ui/*` 导入并按业务修改；完整 profile 列表与实验性支持范围见 [安装指南](/guide/installation#安装-profile-与支持边界)。

## 一次性接入 Wevu 工程

以下全局样式与 Tailwind 配置每个工程只需完成一次，不需要在每个组件页面重复配置。

### 安装构建与样式依赖

```bash
pnpm add wevu clsx @weapp-tailwindcss/merge
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
```

CLI 会递归复制 Registry 文件并输出 npm 的 `Dependencies:` 和 `Dev dependencies:`，但不会修改 `package.json` 或执行包管理器。每次运行 `add` 后，都要使用 `pnpm add` / `pnpm add -D` 安装输出中尚未存在的全部依赖；不同组件还可能报告 `@varo-ui/headless`、`@varo-ui/theme` 等依赖。原生 Registry 源码不依赖 `@varo-ui/weapp` 的 Vue 渲染器；该包只提供另一种原生源码消费入口。

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

先安装至少一个组件，使其依赖闭包生成 `src/styles/`。在 `vite.config.ts` 中收集所有已安装 CSS，按 `varo.css` 优先排序后注入应用全局，再配置 Tailwind：

```ts
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'weapp-vite/config'

const root = import.meta.dirname
const registryStyles = readdirSync(resolve(root, 'src/styles'))
  .filter(name => name.endsWith('.css'))
  .sort((left, right) => left === 'varo.css' ? -1 : right === 'varo.css' ? 1 : left.localeCompare(right))

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    platform: 'weapp',
    styles: [
      ...registryStyles.map(name => ({ source: `styles/${name}`, include: 'app.vue' })),
      { source: 'styles.css', include: 'app.vue' },
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

`styles.source` 相对于 `srcRoot`。`themes/base` 安装 `src/styles/varo.css`，只含 tokens 与基础规则；组件 manifest 安装各自 CSS，Agent 单元另外依赖 `themes/agent` 的 `varo-agent.css`。不能只注册 `varo.css`：每次新增组件后，重启构建进程以重新收集全部样式。该模式与仓库 `apps/platform-smoke/vite.config.mjs` 一致，基础样式先于组件样式。

所有这些文件必须通过 `weapp.styles` 的 `include: 'app.vue'` 全局加载。保留原生 SFC 的 `styleIsolation: apply-shared`，不要在组件局部 `<style>` / WXSS 导入全局主题或组件 CSS；其中应用级选择器不能进入组件 WXSS。H5 Registry 源码会自动导入完整 CSS 依赖闭包，不使用此原生全局注册方式。

### 原生组件的补充样式

优先使用 Tailwind utilities。关键帧、复杂网格等补充样式使用普通 `<style>` 和组件专属 class，并保留组件 JSON 中的 `styleIsolation: apply-shared`。

原生组件不要使用 Vue `<style scoped>`：当前构建链会生成小程序组件 WXSS 不允许的 `[data-v-*]` 属性选择器。组件 WXSS 同样不能使用标签、ID 或属性选择器；选中、禁用等视觉状态应通过脚本中预计算的 class 表达，而不是依赖 `[data-selected]` 等选择器。

仓库的小程序构建会递归检查组件 WXSS 及其样式导入，发现非法选择器时直接失败。这个限制针对组件样式，不要求删除上方应用全局入口中的 `button` 规则。

## 安装组件

```bash
pnpm dlx @varo-ui/cli add --target weapp button form toast
```

把命令末尾的名称替换为需要的组件。安装 Block 或最小 Agent 对话：

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-chat
```

`agent-chat` 只拉取 conversation 闭包，不包含 advanced、RAG 或 fine-tune 文件。确实需要完整套件时才安装 `components/agent-ui`；其他按需单元见 [Agent 安装](/ai/)。

`--target alipay|tt|xhs|donut-android|donut-ios|donut-ohos` 是六个独立的实验性安装 profile，不是 `weapp.platform` 的可互换值。支付宝、抖音、小红书使用各自编译器平台；Donut 使用 `weapp` 编译器和对应宿主元数据。完整依赖闭包未显式准入会拒绝安装，不会回退到微信源码的“已支持”声明。不要把编译通过当作真机验证。

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
