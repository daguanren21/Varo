<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Icon 图标

支持尺寸、颜色和可访问名称的内置图标。

## 交互演示

<FoundationComponentDemo component="icon" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VButton, VIcon } from '@varo-ui/h5'
</script>

<template>
  <VIcon name="check" tone="success" :size="24" label="Saved" />
  <VButton><VIcon name="search" />Search</VButton>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性    | 类型                                                                 | 默认值      | 说明                          |
| ------- | -------------------------------------------------------------------- | ----------- | ----------------------------- |
| `name`  | `string`                                                             | `required`  | 内置图标名                    |
| `size`  | `number / string`                                                    | `16`        | 数字为像素，字符串为 CSS 长度 |
| `color` | `string`                                                             | `—`         | 自定义 CSS 颜色               |
| `tone`  | `'default' / 'primary' / 'success' / 'warning' / 'danger' / 'muted'` | `'default'` | 语义颜色                      |
| `spin`  | `boolean`                                                            | `false`     | 旋转动画                      |
| `label` | `string`                                                             | `—`         | 图标可访问名称                |

## 事件与插槽

无组件事件。默认插槽替换内置图形。常用名称包括 `check`、`close`、`search`、`info`、`loading`、`star` 和 `chevronRight`。

## 行为与平台限制

未提供 `label` 时图标为装饰内容，对辅助技术隐藏。交互操作应放在有名称的按钮上，而不是单独绑定图标。H5 使用 SVG，原生端使用兼容的图标资源。
