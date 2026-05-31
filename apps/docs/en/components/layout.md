# Layout

## Basic Usage

```vue
<template>
  <VRow>
    <VCol :span="8">span 8</VCol>
    <VCol :span="8">span 8</VCol>
    <VCol :span="8">span 8</VCol>
  </VRow>
</template>
```

## Gutter

```vue
<template>
  <VRow :gutter="[8, 12]">
    <VCol :span="12">span 12</VCol>
    <VCol :span="12">span 12</VCol>
  </VRow>
</template>
```

## Offset and Alignment

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

## Cross-platform Preview

<PlatformTabsDemo example="layout" locale="en" />

## Row Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gutter` | `number \| string \| [number \| string, number \| string]` | `undefined` | Grid gutter |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between'` | `'start'` | Main-axis alignment |
| `align` | `'top' \| 'middle' \| 'bottom' \| 'stretch'` | `'top'` | Cross-axis alignment |
| `wrap` | `boolean` | `true` | Whether to wrap |

## Col Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `span` | `number \| string` | `24` | Column span |
| `offset` | `number \| string` | `0` | Left offset |
