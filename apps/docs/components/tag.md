<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Tag 标签

展示标记、可选筛选项和可移除标签。

## 交互演示

<FoundationComponentDemo component="tag" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VTag } from '@varo-ui/h5'
import { ref } from 'vue'

const selected = ref(false)
const visible = ref(true)
</script>

<template>
  <VTag v-model:checked="selected" checkable tone="primary">
    Free delivery
  </VTag>
  <VTag v-if="visible" closeable @close="visible = false">
    Filter
  </VTag>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性        | 类型                                                       | 默认值      | 说明                          |
| ----------- | ---------------------------------------------------------- | ----------- | ----------------------------- |
| `checkable` | `boolean`                                                  | `false`     | 启用选择                      |
| `checked`   | `boolean`                                                  | `false`     | 受控选中状态，v-model:checked |
| `closeable` | `boolean`                                                  | `false`     | 显示移除按钮                  |
| `disabled`  | `boolean`                                                  | `false`     | 禁用选择与移除                |
| `round`     | `boolean`                                                  | `false`     | 圆角样式                      |
| `size`      | `'sm' / 'md' / 'lg'`                                       | `'md'`      | 尺寸                          |
| `tone`      | `'default' / 'primary' / 'success' / 'warning' / 'danger'` | `'default'` | 颜色                          |
| `variant`   | `'solid' / 'soft' / 'outline'`                             | `'soft'`    | 外观                          |

## 事件与插槽

`update:checked` 与 `change` 返回新的布尔选中值。`click` 和 `close` 返回交互事件（H5 DOM 事件，原生端为原生事件对象）。默认插槽为标签内容；原生端还支持 `label` 字符串作为默认文本。

## 行为与平台限制

`close` 不会自动删除标签，请在事件中更新列表或显示状态。通过 v-model 绑定 `checked` 来反映选择。禁用标签不可选择或关闭。
