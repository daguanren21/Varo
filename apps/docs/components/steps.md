<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Steps 步骤条

展示流程进度，并可启用步骤选择。

## 交互演示

<FoundationComponentDemo component="steps" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VSteps } from '@varo-ui/h5'
import { ref } from 'vue'

const current = ref(0)
</script>

<template>
  <VSteps
    v-model:current="current" clickable
    :items="[{ title: 'Cart' }, { title: 'Delivery' }, { title: 'Payment', disabled: true }]"
  />
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性        | 类型                        | 默认值         | 说明                                |
| ----------- | --------------------------- | -------------- | ----------------------------------- |
| `items`     | `Array<string / StepItem>`  | `[]`           | 有序步骤                            |
| `current`   | `number`                    | `0`            | 从零开始的当前序号，v-model:current |
| `direction` | `'horizontal' / 'vertical'` | `'horizontal'` | 布局                                |
| `clickable` | `boolean`                   | `false`        | 启用步骤选择                        |

## 事件与插槽

`StepItem`：`{ title: string, description?: string, disabled?: boolean, icon?: string }`。`select` 返回 `{ index, item }`，再次选择当前可用步骤也会触发；`update:current` 仅在序号变化时返回新序号。`title` 插槽接收 `{ index, item }`。

## 行为与平台限制

组件不会校验表单或切换页面。请保持 `current` 在有效范围，并在父级处理业务规则。`icon` 为标记文本，不是 VIcon 图标名。禁用项和未启用 clickable 的步骤不可选。
