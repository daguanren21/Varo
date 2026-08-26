# Indicator 指示器

## 演示

<PlatformTabsDemo example="indicator" locale="zh" />

## 基础用法

```vue
<template>
  <VIndicator :total="3" :current="1" />
  <VIndicator :total="3" :current="1" type="line" />
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `total` | `number` | `0` | 指示器总数 |
| `current` | `number` | `0` | 当前索引，从 0 开始 |
| `type` | `'dot' \| 'line'` | `'dot'` | 指示器类型 |
