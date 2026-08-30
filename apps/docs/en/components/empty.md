# Empty

Empty state explains the situation and offers a recovery action.

## Demo

<ExtendedComponentDemo example="empty" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VEmpty } from '@varo-ui/h5'
<\/script>

<template>
  <VEmpty title="暂无发布记录" description="创建发布后可在此查看进度。" />
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | Title |
| `description` | `string` | `暂无数据` | Description |
| `icon` | `string` | `info` | Icon |
| `image` | `string` | `undefined` | Image |
| `size` | `sm | md | lg` | `md` | Size |
