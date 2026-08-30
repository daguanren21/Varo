# Badge 徽标

## 演示

<PlatformTabsDemo example="badge" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VBadge } from '@varo-ui/h5'
</script>

<template>
  <VBadge :content="3" />
  <VBadge tone="primary">
    新
  </VBadge>
</template>
```

## 计数与封顶

```vue
<template>
  <VBadge :content="12" />
  <VBadge :content="120" :max="99" tone="warning" />
</template>
```

## 零值与状态点

```vue
<template>
  <VBadge :content="0" show-zero tone="default" />
  <VBadge aria-label="在线" dot tone="success" />
</template>
```

## 变体与语义色

```vue
<template>
  <VBadge tone="primary">
    新
  </VBadge>
  <VBadge tone="success" variant="soft">
    稳定
  </VBadge>
  <VBadge tone="warning" variant="outline">
    审核
  </VBadge>
</template>
```

## Props

| Prop       | 类型                                                           | 默认值      | 描述             |
| ---------- | -------------------------------------------------------------- | ----------- | ---------------- |
| `content`  | `number \| string`                                             | `undefined` | 徽标内容         |
| `dot`      | `boolean`                                                      | `false`     | 仅显示状态点     |
| `max`      | `number`                                                       | `99`        | 数值内容的封顶值 |
| `showZero` | `boolean`                                                      | `false`     | 显示数值 `0`     |
| `tone`     | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'danger'`  | 语义色           |
| `variant`  | `'solid' \| 'soft' \| 'outline'`                               | `'solid'`   | 视觉变体         |

## Slots

| Slot      | 描述           |
| --------- | -------------- |
| `default` | 自定义徽标内容 |

## Data Attributes

| Attribute      | 描述         |
| -------------- | ------------ |
| `data-dot`     | 是否为状态点 |
| `data-tone`    | 当前语义色   |
| `data-variant` | 当前视觉变体 |
