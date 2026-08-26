# Indicator

## Demo

<PlatformTabsDemo example="indicator" locale="en" />

## Basic Usage

```vue
<template>
  <VIndicator :total="3" :current="1" />
  <VIndicator :total="3" :current="1" type="line" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `total` | `number` | `0` | Total indicators |
| `current` | `number` | `0` | Active index, zero-based |
| `type` | `'dot' \| 'line'` | `'dot'` | Indicator type |
