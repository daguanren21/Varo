# Space

## Demo

<PlatformTabsDemo example="space" locale="en" />

## Basic Usage

```vue
<template>
  <VSpace>
    <VButton size="sm">Button</VButton>
    <VButton size="sm">Button</VButton>
  </VSpace>
</template>
```

## Direction and Size

```vue
<template>
  <VSpace direction="vertical" :size="[8, 12]">
    <VButton size="sm">Button</VButton>
    <VButton size="sm">Button</VButton>
  </VSpace>
</template>
```

## Wrap and Fill

```vue
<template>
  <VSpace :size="8" wrap>
    <VButton size="sm">Button</VButton>
    <VButton size="sm">Button</VButton>
    <VButton size="sm">Button</VButton>
  </VSpace>
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Space direction |
| `size` | `number \| string \| [number \| string, number \| string]` | `undefined` | Gap size |
| `align` | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'` | `'start'` | Cross-axis alignment |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` | Main-axis alignment |
| `wrap` | `boolean` | `false` | Whether to wrap |
| `fill` | `boolean` | `false` | Whether children fill width |
