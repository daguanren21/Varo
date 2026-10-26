<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# SwipeCell 滑动单元格

通过滑动单元格展示上下文操作。

## 交互演示

<FoundationComponentDemo component="swipe-cell" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VButton, VSwipeCell } from '@varo-ui/h5'
import { ref } from 'vue'

const archived = ref(false)
function archive() {
  archived.value = true
}
</script>

<template>
  <VSwipeCell :right-width="88">
    <template #right="{ close }">
      <VButton @click="archive(); close()">
        Archive
      </VButton>
    </template>
    <template #default="{ open, close }">
      <p>Order #1024</p>
      <VButton @click="open('right')">
        Actions
      </VButton>
      <VButton @click="close()">
        Close
      </VButton>
    </template>
  </VSwipeCell>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性         | 类型                           | 默认值      | 说明                                |
| ------------ | ------------------------------ | ----------- | ----------------------------------- |
| `modelValue` | `'left' / 'right' / undefined` | `undefined` | 展开方向，v-model；undefined 为关闭 |
| `leftWidth`  | `number`                       | `0`         | 左侧操作宽度，单位像素              |
| `rightWidth` | `number`                       | `0`         | 右侧操作宽度，单位像素              |
| `threshold`  | `number`                       | `0.3`       | 打开所需位移占操作区宽度的比例      |
| `disabled`   | `boolean`                      | `false`     | 禁用用户打开、关闭和滑动            |

## 事件与插槽

`update:modelValue` 返回 `left`、`right`，关闭时为 undefined。`open` 返回方向，`close` 无参数。默认插槽接收 `{ open, close }`；`left` 和 `right` 插槽接收 `{ close }`。

## 行为与平台限制

每个操作方向需设置正宽度，插槽不会自动测量。H5 滑动使用触摸事件，不支持鼠标拖动。请为桌面和键盘用户提供显式按钮。组件不会删除或归档数据，这些行为由操作事件负责。
