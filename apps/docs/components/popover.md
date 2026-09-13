# Popover 气泡浮层

## 演示

<PlatformTabsDemo example="popover" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import {
  VPopoverClose,
  VPopoverContent,
  VPopoverRoot,
  VPopoverTrigger
} from '@varo-ui/h5'
</script>

<template>
  <VPopoverRoot>
    <VPopoverTrigger>订单操作</VPopoverTrigger>
    <VPopoverContent align="start" side="bottom">
      <strong>订单 #1042</strong>
      <VPopoverClose>完成</VPopoverClose>
    </VPopoverContent>
  </VPopoverRoot>
</template>
```

## 定位与对齐

`side` 控制 `top`、`right`、`bottom`、`left`，`align` 控制 `start`、`center`、`end`。

## Root Props

| Prop          | 类型                   | 默认值      | 描述           |
| ------------- | ---------------------- | ----------- | -------------- |
| `open`        | `boolean \| undefined` | `undefined` | 受控打开状态   |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始状态 |
| `disabled`    | `boolean`              | `false`     | 禁用触发器     |

## Content Props

| Prop    | 类型                                     | 默认值     | 描述     |
| ------- | ---------------------------------------- | ---------- | -------- |
| `side`  | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | 浮层方向 |
| `align` | `'start' \| 'center' \| 'end'`           | `'center'` | 浮层对齐 |
| `as`    | `string`                                 | `'div'`    | 渲染元素 |

## Events

| Event         | Payload   | 描述         |
| ------------- | --------- | ------------ |
| `update:open` | `boolean` | 受控状态同步 |
| `openChange`  | `boolean` | 打开状态变化 |

## Parts

| Part              | 作用     |
| ----------------- | -------- |
| `VPopoverRoot`    | 状态容器 |
| `VPopoverTrigger` | 触发器   |
| `VPopoverContent` | 定位内容 |
| `VPopoverClose`   | 显式关闭 |
