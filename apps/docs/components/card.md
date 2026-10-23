<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Card 卡片

用标题、正文与操作区组织内容。

## 交互演示

<FoundationComponentDemo component="card" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VButton, VCard, VCardContent, VCardFooter, VCardHeader, VCardTitle } from '@varo-ui/h5'
</script>

<template>
  <VCard variant="outline">
    <VCardHeader><VCardTitle>Weekend trip</VCardTitle></VCardHeader>
    <VCardContent>Two nights, flexible cancellation.</VCardContent>
    <VCardFooter><VButton>Book</VButton></VCardFooter>
  </VCard>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性          | 类型                                           | 默认值      | 说明         |
| ------------- | ---------------------------------------------- | ----------- | ------------ |
| `as`          | `string`                                       | `'section'` | H5 根元素    |
| `interactive` | `boolean`                                      | `false`     | 启用按钮交互 |
| `padding`     | `boolean`                                      | `true`      | 内边距       |
| `variant`     | `'default' / 'outline' / 'elevated' / 'muted'` | `'default'` | 外观         |

## 事件与插槽

没有专有状态事件。交互卡片可监听 `@click`。H5 子组件（`VCardHeader`、`VCardTitle`、`VCardDescription`、`VCardContent`、`VCardFooter`）均支持 `as` 和默认插槽。原生端使用 `header`、`title`、`description`、默认和 `footer` 插槽，而不是 H5 子组件。

## 行为与平台限制

包含独立按钮时请使用非交互卡片；交互卡片应仅表达一个操作。原生 Card 不通过 `as` 渲染任意 HTML 元素，可用 `ariaLabel` 提供可访问名称。
