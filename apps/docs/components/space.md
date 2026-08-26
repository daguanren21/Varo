# Space

## 演示

<PlatformTabsDemo example="space" locale="zh" />

## 基础用法

```vue
<template>
  <VSpace>
    <VButton size="sm">按钮</VButton>
    <VButton size="sm">按钮</VButton>
  </VSpace>
</template>
```

## 方向与尺寸

```vue
<template>
  <VSpace direction="vertical" :size="[8, 12]">
    <VButton size="sm">按钮</VButton>
    <VButton size="sm">按钮</VButton>
  </VSpace>
</template>
```

## 换行与填充

```vue
<template>
  <VSpace :size="8" wrap>
    <VButton size="sm">按钮</VButton>
    <VButton size="sm">按钮</VButton>
    <VButton size="sm">按钮</VButton>
  </VSpace>
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 间距方向 |
| `size` | `number \| string \| [number \| string, number \| string]` | `undefined` | 间距尺寸 |
| `align` | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'` | `'start'` | 交叉轴对齐 |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` | 主轴对齐 |
| `wrap` | `boolean` | `false` | 是否换行 |
| `fill` | `boolean` | `false` | 子元素是否填满宽度 |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | 间距内容 |
