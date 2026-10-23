<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# NoticeBar 通知栏

支持关闭的行内状态通知。

## 交互演示

<FoundationComponentDemo component="notice-bar" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VNoticeBar } from '@varo-ui/h5'
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
  <VNoticeBar
    v-model:visible="visible" closeable tone="info"
    text="Your order has shipped."
  />
  <VNoticeBar wrapable text="Save your work before scheduled maintenance." />
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性         | 类型                                        | 默认值      | 说明                      |
| ------------ | ------------------------------------------- | ----------- | ------------------------- |
| `text`       | `string`                                    | `—`         | 消息文本                  |
| `visible`    | `boolean`                                   | `true`      | 显示状态，v-model:visible |
| `tone`       | `'info' / 'success' / 'warning' / 'danger'` | `'warning'` | 状态颜色                  |
| `icon`       | `string`                                    | `'info'`    | 前置图标                  |
| `closeable`  | `boolean`                                   | `false`     | 显示关闭按钮              |
| `scrollable` | `boolean`                                   | `false`     | 单行文本滚动              |
| `wrapable`   | `boolean`                                   | `false`     | 文本换行，优先于滚动      |

## 事件与插槽

关闭时 `update:visible` 返回 false，`close` 返回交互事件（H5 DOM 事件，原生端为原生事件对象）。默认插槽替换 `text`，`icon` 替换前置图标，`action` 替换关闭按钮。

## 行为与平台限制

绑定显示状态才能保持关闭结果。组件不提供自动关闭计时器。换行会禁用滚动。自定义 `action` 内容需自行实现操作及可访问名称。
