<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# ActionSheet 动作面板

从底部展示简短的上下文操作列表。

## 交互演示

<FoundationComponentDemo component="action-sheet" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VActionSheet } from '@varo-ui/h5'
import { ref } from 'vue'

const visible = ref(true)
const selected = ref<unknown>()
function handleSelect({ item }: { item: { value?: unknown } }) {
  selected.value = item.value
}
</script>

<template>
  <VActionSheet
    v-model:visible="visible" title="File actions"
    :actions="[{ name: 'Save', value: 'save' }, { name: 'Unavailable', disabled: true }]"
    cancel-text="Cancel" @select="handleSelect"
  />
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性            | 类型                | 默认值      | 说明                       |
| --------------- | ------------------- | ----------- | -------------------------- |
| `visible`       | `boolean`           | `undefined` | 显示状态，v-model:visible  |
| `actions`       | `ActionSheetItem[]` | `[]`        | 操作项                     |
| `title`         | `string`            | `—`         | 标题                       |
| `description`   | `string`            | `—`         | 说明                       |
| `cancelText`    | `string`            | `—`         | 取消按钮文本，未提供则隐藏 |
| `closeOnSelect` | `boolean`           | `true`      | 选择可用项后关闭           |

## 事件与插槽

`ActionSheetItem`：`{ name: string, value?: unknown, description?: string, color?: string, disabled?: boolean, loading?: boolean }`。`select` 返回 `{ index, item }`；`cancel` 无参数；`close` 返回 `cancel`、`overlay` 或 `select`；`update:visible` 返回布尔值。`header` 插槽替换标题和说明，默认插槽位于操作列表之后。

## 行为与平台限制

禁用或加载中的项目不可选。业务操作由页面负责，组件不会执行项目的 value。`closeOnSelect=false` 时，在业务成功后主动关闭。原生端使用原生弹层而非 H5 portal。
