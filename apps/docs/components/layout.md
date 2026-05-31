# Layout

## 基础用法

```vue
<template>
  <VRow>
    <VCol :span="8">span 8</VCol>
    <VCol :span="8">span 8</VCol>
    <VCol :span="8">span 8</VCol>
  </VRow>
</template>
```

## 间距

```vue
<template>
  <VRow :gutter="[8, 12]">
    <VCol :span="12">span 12</VCol>
    <VCol :span="12">span 12</VCol>
  </VRow>
</template>
```

## 偏移与对齐

```vue
<template>
  <VRow justify="space-between">
    <VCol :span="6">left</VCol>
    <VCol :span="6">right</VCol>
  </VRow>

  <VRow>
    <VCol :span="10" :offset="2">offset 2</VCol>
  </VRow>
</template>
```

## 跨端演示

<PlatformTabsDemo example="layout" locale="zh" />

## Row Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `gutter` | `number \| string \| [number \| string, number \| string]` | `undefined` | 栅格间距 |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between'` | `'start'` | 主轴对齐 |
| `align` | `'top' \| 'middle' \| 'bottom' \| 'stretch'` | `'top'` | 交叉轴对齐 |
| `wrap` | `boolean` | `true` | 是否换行 |

## Col Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `span` | `number \| string` | `24` | 栅格占位 |
| `offset` | `number \| string` | `0` | 左侧偏移 |
