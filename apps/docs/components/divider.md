# Divider

## 演示

<PlatformTabsDemo example="divider" locale="zh" />

## 基础用法

```vue
<template>
  <VDivider />
</template>
```

## 展示文本

```vue
<template>
  <VDivider>文本</VDivider>
  <VDivider content-position="left">左侧文本</VDivider>
  <VDivider content-position="right">右侧文本</VDivider>
</template>
```

## 虚线与纵向分割

```vue
<template>
  <VDivider dashed>虚线</VDivider>
  <span>文本</span>
  <VDivider vertical />
  <span>链接</span>
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `contentPosition` | `'left' \| 'center' \| 'right'` | `'center'` | 文本位置 |
| `dashed` | `boolean` | `false` | 是否虚线 |
| `hairline` | `boolean` | `true` | 是否细线 |
| `vertical` | `boolean` | `false` | 是否纵向分割线 |
| `lineColor` | `string` | `undefined` | 分割线颜色 |
| `textColor` | `string` | `undefined` | 文本颜色 |
| `borderColor` | `string` | `undefined` | 分割线颜色别名 |
| `spacing` | `number \| string` | `undefined` | 外边距尺寸 |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | 分割线文本 |
