# Tabbar 标签栏

## 演示

<PlatformTabsDemo example="tabbar" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VTabbar, VTabbarItem } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const active = shallowRef('home')
</script>

<template>
  <VTabbar v-model="active" aria-label="主要导航">
    <VTabbarItem name="home">
      <template #icon>
        <img src="/icons/home.svg" alt="">
      </template>
      首页
    </VTabbarItem>
    <VTabbarItem name="messages" badge="2">
      <template #icon>
        <img src="/icons/message.svg" alt="">
      </template>
      消息
    </VTabbarItem>
    <VTabbarItem name="profile" dot>
      <template #icon>
        <img src="/icons/profile.svg" alt="">
      </template>
      我的
    </VTabbarItem>
  </VTabbar>
</template>
```

## VTabbar Props

| Prop                  | 类型               | 默认值      | 描述               |
| --------------------- | ------------------ | ----------- | ------------------ |
| `modelValue`          | `string \| number` | `undefined` | 当前选中项         |
| `fixed`               | `boolean`          | `false`     | 是否固定在底部     |
| `border`              | `boolean`          | `true`      | 是否显示边框       |
| `safeAreaInsetBottom` | `boolean`          | `false`     | 是否启用底部安全区 |

## VTabbar Events

| Event               | Payload            | 描述       |
| ------------------- | ------------------ | ---------- |
| `update:modelValue` | `string \| number` | 选中项变化 |
| `change`            | `string \| number` | 选中项变化 |

## VTabbarItem Props

| Prop    | 类型               | 默认值      | 描述             |
| ------- | ------------------ | ----------- | ---------------- |
| `name`  | `string \| number` | -           | 标签项标识       |
| `icon`  | `string`           | `undefined` | 图标文本或图标名 |
| `badge` | `string \| number` | `undefined` | 徽标             |
| `dot`   | `boolean`          | `false`     | 是否显示小红点   |

## VTabbarItem Slots

| Slot      | 描述                                   |
| --------- | -------------------------------------- |
| `default` | 标签文本                               |
| `icon`    | 自定义图标，作为装饰内容隐藏于无障碍树 |
