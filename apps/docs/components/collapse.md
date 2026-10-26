<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Collapse 折叠面板

以单项或多项展开的方式组织内容。

## 交互演示

<FoundationComponentDemo component="collapse" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VCollapse, VCollapseItem } from '@varo-ui/h5'
import { ref } from 'vue'

const expanded = ref<string[]>(['delivery'])
</script>

<template>
  <VCollapse v-model:value="expanded">
    <VCollapseItem value="delivery" title="Delivery">
      Ships in two days.
    </VCollapseItem>
    <VCollapseItem value="returns" title="Returns">
      Return within seven days.
    </VCollapseItem>
  </VCollapse>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性           | 类型                | 默认值      | 说明                      |
| -------------- | ------------------- | ----------- | ------------------------- |
| `accordion`    | `boolean`           | `false`     | 单项展开模式              |
| `value`        | `string / string[]` | `undefined` | 受控展开项，v-model:value |
| `defaultValue` | `string / string[]` | `undefined` | 非受控初始值              |
| `collapsible`  | `boolean`           | `true`      | 单项模式允许关闭最后一项  |
| `disabled`     | `boolean`           | `false`     | 禁用所有标题操作          |

## 事件与插槽

`update:value` 和 `change` 返回新字符串（单项模式）或字符串数组（多项模式）。`VCollapseItem` 必须提供唯一字符串 `value`，支持 `title?: string` 和 `disabled?: boolean`（默认 false）。`title` 插槽替换标题，默认插槽为展开内容。组默认插槽放置各个面板。

## 行为与平台限制

多项模式用字符串数组初始化，单项模式使用字符串。不要在受控状态下期待修改 `defaultValue` 重置组件。H5 支持手风琴键盘操作，原生标题使用原生交互语义。
