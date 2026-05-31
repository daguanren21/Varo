# Primitives

这里只放交互和行为 primitive，方便按底层能力查看；静态展示类组件继续留在组件文档里。

## 交互 Primitive

| Primitive | 包 | 能力 |
| --- | --- | --- |
| `DialogRoot` / `DialogTrigger` / `DialogOverlay` / `DialogContent` / `DialogClose` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 开关状态、触发器、遮罩、内容区、关闭动作 |
| `OverlayRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 显隐控制、点击遮罩关闭、滚动锁定 |
| `PopupRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 弹出层显隐、位置、遮罩、关闭按钮 |
| `StickyRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 滚动监听、固定状态、顶部偏移 |

## 使用方式

```vue
<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'
</script>

<template>
  <DialogRoot>
    <DialogTrigger>打开</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <DialogClose>关闭</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

