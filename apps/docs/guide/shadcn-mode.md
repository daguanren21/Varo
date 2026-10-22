# Wevu Registry 模式

CLI 将支持所选 profile 的原生 Wevu 源码复制到项目中，可从 `src/components/ui/*` 导入并修改。profile 列表与实验性支持范围见 [安装指南](/guide/installation#安装-profile-与支持边界)。

## 一次性接入 Wevu 工程

全局样式与 Tailwind 每个工程配置一次即可。

### 安装构建与样式依赖

```bash
pnpm add wevu clsx @weapp-tailwindcss/merge
pnpm add -D weapp-vite weapp-tailwindcss tailwindcss
```

CLI 递归复制 Registry 文件并列出 npm 的 `Dependencies:` 和 `Dev dependencies:`，不修改 `package.json` 或执行包管理器。每次 `add` 后，用 `pnpm add` / `pnpm add -D` 安装列出但尚未安装的依赖，包括组件可能需要的 `@varo-ui/headless`、`@varo-ui/theme` 等包。原生 Registry 源码无需 Vue 渲染器；`@varo-ui/weapp` 是另一种原生源码获取方式。

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

先安装至少一个组件及其依赖，生成 `src/styles/`。在 `vite.config.ts` 中收集全部 CSS，将 `varo.css` 排在最前，再注册为全局样式并配置 Tailwind：

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

`styles.source` 相对于 `srcRoot`。`themes/base` 安装的 `src/styles/varo.css` 只含 tokens 与基础规则；各组件 manifest 安装自身 CSS，Agent 还依赖 `themes/agent` 的 `varo-agent.css`。每次新增组件后须重启构建，重新收集包括 `varo.css` 在内的全部样式。仓库 `apps/platform-smoke/vite.config.mjs` 采用同样配置，先加载基础样式，再加载组件样式。

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

`agent-chat` 只安装 conversation 及其依赖，不含 advanced、RAG 或 fine-tune 文件。需要完整套件时安装 `components/agent-ui`；其他单元见 [Agent 安装](/ai/)。

`--target alipay|tt|xhs|donut-android|donut-ios|donut-ohos` 是六个独立的实验性安装 profile，不是 `weapp.platform` 的可互换值。支付宝、抖音、小红书使用各自编译器平台；Donut 使用 `weapp` 编译器和对应宿主元数据。条目及全部传递依赖须显式声明支持，否则拒绝安装，不回退到微信源码。编译通过仍需真机验证。

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
