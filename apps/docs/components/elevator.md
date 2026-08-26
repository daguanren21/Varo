# Elevator 电梯楼层

## 演示

<PlatformTabsDemo example="elevator" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VElevator } from '@varo/ui-h5'

const activeIndex = ref('A')
const indexes = [
  { title: 'A', items: ['安徽', '澳门', '安庆'] },
  { title: 'B', items: ['北京', '保定', '包头'] },
  { title: 'C', items: ['成都', '重庆', '长沙'] }
]
</script>

<template>
  <VElevator v-model:active-index="activeIndex" :indexes="indexes" />
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `activeIndex` | `string` | `undefined` | 当前激活索引 |
| `defaultActiveIndex` | `string` | `undefined` | 非受控默认索引 |
| `indexes` | `ElevatorGroup[]` | `[]` | 楼层分组 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:activeIndex` | `string` | 索引变化 |
| `change` | `string` | 索引变化 |
| `clickItem` | `(item, index)` | 点击分组内容 |
