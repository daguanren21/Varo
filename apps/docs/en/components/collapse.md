# Collapse

Collapse progressively discloses secondary content.

## Demo

<ExtendedComponentDemo example="collapse" locale="en" />

## Basic usage

```vue
<script setup lang="ts">
import { VCollapse, VCollapseItem } from '@varo-ui/h5'
<\/script>

<template>
  <VCollapse v-model:value="value"><VCollapseItem value="details" title="详情">内容</VCollapseItem></VCollapse>
</template>
```

## Interaction contract

The live demo covers light/dark themes, keyboard focus, press feedback, and reduced motion.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string | string[]` | `undefined` | Controlled value |
| `defaultValue` | `string | string[]` | `undefined` | Default value |
| `accordion` | `boolean` | `false` | Accordion mode |
| `collapsible` | `boolean` | `true` | Allow collapse |
| `disabled` | `boolean` | `false` | Disabled |
