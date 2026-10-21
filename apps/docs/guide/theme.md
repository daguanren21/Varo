# 主题配置

Varo 通过 `@varo-ui/theme` 管理主题，将视觉 token 与交互逻辑、组件封装分开维护。

Registry 样式源码位于 `registry/themes/**/*`，由组件 manifest 声明依赖。`themes/base` 只含 tokens 与基础规则；组件 CSS 随依赖安装，Agent 还依赖可选的 `themes/agent`。H5 源码自动导入所需 CSS；原生端须将全部 `src/styles/*.css` 按 `varo.css` 优先的顺序全局注册到 `app.vue`，不可导入组件局部 WXSS。配置见 [Wevu Registry](/guide/shadcn-mode)；npm 原生项目全局加载完整的 `@varo-ui/weapp/style.css`。

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

应用级主题可以传入 `shallowRef`；Provider 会响应替换后的主题，并在应用卸载时恢复它原本接管的根变量。需要在一个页面中隔离多个主题时，使用作用域组件：

```vue
<script setup lang="ts">
import { createTheme, VaroThemeProvider } from '@varo-ui/theme'
import { shallowRef } from 'vue'

const activeTheme = shallowRef(createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133'
}))
</script>

<template>
  <VaroThemeProvider :theme="activeTheme">
    <RouterView />
  </VaroThemeProvider>
</template>
```

主题种子使用 `#RGB` 或 `#RRGGBB`，以便自动计算满足对比度要求的前景色。`VButton color` 使用 CSS 变量、命名色或 `rgb()` 时，必须同时传入 `foreground-color`。

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

插件在 Vite `transform` 阶段处理样式，无需提交生成的 WXSS。

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

用新的 `ThemeDefinition` 替换 `activeTheme.value`，Provider 会重算内联 CSS 变量，子树中的 Varo 组件随即继承更新。多页面应用将 Provider 放在共享页面壳中，不要在 App 生命周期中操作样式。

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

- palette、semantic、component token 分层维护
- wrapper 组件使用 token，不硬编码业务品牌色
- light / dark 使用同一颜色引擎，保持品牌色和颜色语义一致

## 推荐实践

- 通过同一个主题入口配置品牌色、语义色与状态色
- H5 与小程序侧尽量共享同一份语义 token
- 二次封装组件库时优先扩展 token，而不是直接覆盖组件内部样式
