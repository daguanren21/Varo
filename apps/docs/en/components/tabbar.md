# Tabbar

## Demo

<PlatformTabsDemo example="tabbar" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { VTabbar, VTabbarItem } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const active = shallowRef('home')
</script>

<template>
  <VTabbar v-model="active" aria-label="Primary navigation">
    <VTabbarItem name="home">
      <template #icon>
        <img src="/icons/home.svg" alt="">
      </template>
      Home
    </VTabbarItem>
    <VTabbarItem name="messages" badge="2">
      <template #icon>
        <img src="/icons/message.svg" alt="">
      </template>
      Messages
    </VTabbarItem>
    <VTabbarItem name="profile" dot>
      <template #icon>
        <img src="/icons/profile.svg" alt="">
      </template>
      Profile
    </VTabbarItem>
  </VTabbar>
</template>
```

## VTabbar Props

| Prop                  | Type               | Default     | Description             |
| --------------------- | ------------------ | ----------- | ----------------------- |
| `modelValue`          | `string \| number` | `undefined` | Selected item           |
| `fixed`               | `boolean`          | `false`     | Fix to bottom           |
| `border`              | `boolean`          | `true`      | Show border             |
| `safeAreaInsetBottom` | `boolean`          | `false`     | Enable bottom safe area |

## VTabbar Events

| Event               | Payload            | Description           |
| ------------------- | ------------------ | --------------------- |
| `update:modelValue` | `string \| number` | Selected item changed |
| `change`            | `string \| number` | Selected item changed |

## VTabbarItem Props

| Prop    | Type               | Default     | Description            |
| ------- | ------------------ | ----------- | ---------------------- |
| `name`  | `string \| number` | -           | Item name              |
| `icon`  | `string`           | `undefined` | Icon text or icon name |
| `badge` | `string \| number` | `undefined` | Badge                  |
| `dot`   | `boolean`          | `false`     | Show red dot           |

## VTabbarItem Slots

| Slot      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `default` | Item label                                                   |
| `icon`    | Custom icon, treated as decorative in the accessibility tree |
