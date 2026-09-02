# Elevator 电梯楼层

`VElevator` 会在内容滚动时根据当前分组标题同步右侧索引；滚动到底部时固定到最后一组，点击索引仍使用平滑滚动。

## 演示

<PlatformTabsDemo example="elevator" locale="zh" />

## 基础用法

```vue
<script setup lang="ts">
import { VElevator } from '@varo-ui/h5'
import { ref } from 'vue'

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

## 滚动同步

- 分组标题越过内容容器顶部时，`activeIndex` 自动切换。
- 内容滚动到底部时，最后一个索引保持激活，避免短分组无法触顶。
- 点击右侧索引会立即更新状态并平滑滚动到对应分组。

## Props

| Prop                 | 类型              | 默认值      | 描述           |
| -------------------- | ----------------- | ----------- | -------------- |
| `activeIndex`        | `string`          | `undefined` | 当前激活索引   |
| `defaultActiveIndex` | `string`          | `undefined` | 非受控默认索引 |
| `indexes`            | `ElevatorGroup[]` | `[]`        | 楼层分组       |

## Events

| Event                | Payload         | 描述         |
| -------------------- | --------------- | ------------ |
| `update:activeIndex` | `string`        | 索引变化     |
| `change`             | `string`        | 索引变化     |
| `clickItem`          | `(item, index)` | 点击分组内容 |
