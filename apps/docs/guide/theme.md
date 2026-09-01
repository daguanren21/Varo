# 主题配置

Varo 的主题能力集中在 `@varo-ui/theme`，目标是让交互层、组件封装层与视觉 token 解耦。

## H5 基础接入

```ts
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { createApp } from 'vue'
import App from './App.vue'

const theme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a'
})

createApp(App).use(VaroConfigProvider, { theme }).mount('#app')
```

## Weapp 构建时主题

固定品牌主题应在构建时写入全局 WXSS。`createVaroWeappThemePlugin` 会把完整的 `page { --varo-ui-* }` 变量附加到应用样式：

```ts
import { resolve } from 'node:path'
import { createVaroWeappThemePlugin } from '@varo-ui/theme/weapp-vite'
import { defineConfig } from 'weapp-vite/config'
import { theme } from './src/theme'

export default defineConfig({
  plugins: [
    createVaroWeappThemePlugin({
      appStyle: resolve(import.meta.dirname, 'src/app.scss'),
      theme
    })
  ]
})
```

这层集成运行在 Vite `transform` 阶段，不需要提交生成后的 WXSS。

## Weapp 运行时切换

安装目标专用的可编辑 Provider：

```bash
pnpm dlx @varo-ui/cli add --target weapp components/theme-provider
```

小程序的 App 没有可承载样式的 DOM 根节点，因此运行时变量需要绑定到页面根组件：

```vue
<script setup lang="ts">
import { createTheme } from '@varo-ui/theme/weapp'
import { shallowRef } from 'wevu'
import VThemeProvider from '@/components/ui/v-theme-provider.vue'

const activeTheme = shallowRef(createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a'
}))
</script>

<template>
  <VThemeProvider :theme="activeTheme">
    <view>页面内容</view>
  </VThemeProvider>
</template>
```

用新的 `ThemeDefinition` 替换 `activeTheme.value` 后，Provider 会重新计算内联 CSS Variables；子树中的 Varo 组件通过变量继承立即更新。多页面应用应把 Provider 放进共享页面壳，而不是在 App 生命周期中操作样式。

## 暗色模式

`mode: 'dark'` 会生成暗色文字、边框、填充和背景层级，同时保留微信绿主色与语义色：

```ts
const darkTheme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
  mode: 'dark'
})
```

## 设计原则

- palette、semantic、component token 分层
- wrapper 组件只消费 token，不硬编码业务品牌色
- light / dark 由同一颜色引擎生成，品牌色和语义不漂移

## 推荐实践

- 品牌色、语义色与状态色都从一个主题入口收敛
- H5 与小程序侧尽量共享同一份语义 token
- 二次封装组件库时优先扩展 token，而不是直接覆盖组件内部样式
