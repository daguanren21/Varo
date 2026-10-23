<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# SafeArea 安全区域

为指定边添加设备安全区内边距。

## 交互演示

<FoundationComponentDemo component="safe-area" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VButton, VSafeArea } from '@varo-ui/h5'
</script>

<template>
  <VSafeArea :edges="['bottom', 'left', 'right']">
    <VButton>Continue</VButton>
  </VSafeArea>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性    | 类型                                         | 默认值       | 说明                                               |
| ------- | -------------------------------------------- | ------------ | -------------------------------------------------- |
| `as`    | `string`                                     | `'div'`      | H5 根元素；原生 text/span 映射为 text，其余为 view |
| `edges` | `Array<'top' / 'right' / 'bottom' / 'left'>` | `['bottom']` | 应用安全区内边距的方向                             |

## 事件与插槽

无组件事件。默认插槽放置需要避开安全区域的内容。

## 行为与平台限制

使用 CSS 环境安全区值，而非固定占位高度。桌面或矩形设备上的值可能为零。组件不会固定底栏或模拟刘海。H5 按需配置页面 viewport 以支持全屏显示，避免重复应用安全区。
