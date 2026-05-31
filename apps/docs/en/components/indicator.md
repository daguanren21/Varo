# Indicator

## Basic Usage

```vue
<template>
  <VIndicator :total="3" :current="1" />
  <VIndicator :total="3" :current="1" type="line" />
</template>
```

## Cross-platform Preview

<PlatformTabsDemo example="indicator" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `total` | `number` | `0` | Total indicators |
| `current` | `number` | `0` | Active index, zero-based |
| `type` | `'dot' \| 'line'` | `'dot'` | Indicator type |

