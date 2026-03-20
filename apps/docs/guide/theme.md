# 主题配置

Varo 的主题能力集中在 `@varo/theme`，目标是让交互层、组件封装层与视觉 token 解耦。

## 基础接入

```ts
import { createApp } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo/theme'
import App from './App.vue'

const theme = createTheme({
  primary: '#0f766e',
  success: '#15803d',
  warning: '#c2410c',
  error: '#b91c1c',
  neutral: '#172033'
})

createApp(App).use(VaroConfigProvider, { theme }).mount('#app')
```

## 设计原则

- palette、semantic、component token 分层
- wrapper 组件只消费 token，不硬编码业务品牌色
- 后续可以继续接入颜色引擎、多品牌主题与暗黑模式

## 推荐实践

- 品牌色、语义色与状态色都从一个主题入口收敛
- H5 与小程序侧尽量共享同一份语义 token
- 二次封装组件库时优先扩展 token，而不是直接覆盖组件内部样式