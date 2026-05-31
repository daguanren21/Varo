# Divider

## Basic Usage

```vue
<template>
  <VDivider />
</template>
```

## Text

```vue
<template>
  <VDivider>Text</VDivider>
  <VDivider content-position="left">Left</VDivider>
  <VDivider content-position="right">Right</VDivider>
</template>
```

## Dashed and Vertical

```vue
<template>
  <VDivider dashed>Dashed</VDivider>
  <span>Text</span>
  <VDivider vertical />
  <span>Link</span>
</template>
```

## Cross-platform Preview

<PlatformTabsDemo example="divider" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `contentPosition` | `'left' \| 'center' \| 'right'` | `'center'` | Text position |
| `dashed` | `boolean` | `false` | Dashed line |
| `hairline` | `boolean` | `true` | Hairline marker |
| `vertical` | `boolean` | `false` | Vertical divider |
| `lineColor` | `string` | `undefined` | Line color |
| `textColor` | `string` | `undefined` | Text color |
| `borderColor` | `string` | `undefined` | Alias for line color |
| `spacing` | `number \| string` | `undefined` | Spacing size |
