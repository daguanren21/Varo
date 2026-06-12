# Primitives

Primitives 不是另一套 UI 组件清单，而是 Varo 的运行时契约：它们定义状态、触发器、遮罩、定位、滚动和关闭行为，让 H5 与小程序封装可以共享同一套交互语义。展示类组件继续留在组件文档里，这里只保留会影响行为组合的底层能力。

<div class="varo-primitive-stack">
  <section>
    <span>01</span>
    <h2>运行时契约</h2>
    <p>Root 负责状态与上下文，Trigger 负责入口，Content/Overlay 负责可见层，Close 负责退出动作。不同平台可以换渲染细节，但不能改变契约。</p>
  </section>
  <section>
    <span>02</span>
    <h2>组合顺序</h2>
    <p>先放 Root，再放 Trigger，然后放 Overlay 与 Content。组合顺序稳定后，业务 blocks 才能在 H5 和小程序间保持一致。</p>
  </section>
  <section>
    <span>03</span>
    <h2>受控与非受控</h2>
    <p>简单场景使用内部状态；需要埋点、路由同步或表单联动时，使用受控与非受控两种写法切换。</p>
  </section>
</div>

## 交互 Primitive

| Primitive | 包 | 能力 |
| --- | --- | --- |
| `DialogRoot` / `DialogTrigger` / `DialogOverlay` / `DialogContent` / `DialogClose` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 开关状态、触发器、遮罩、内容区、关闭动作 |
| `OverlayRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 显隐控制、点击遮罩关闭、滚动锁定 |
| `PopupRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 弹出层显隐、位置、遮罩、关闭按钮 |
| `StickyRoot` | `@varo/primitives-h5`、`@varo/primitives-weapp` | 滚动监听、固定状态、顶部偏移 |

## 非受控写法

适合局部确认、菜单和轻量反馈，状态由 primitive 内部维护。

```vue
<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'
</script>

<template>
  <DialogRoot>
    <DialogTrigger>打开</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <p>确认继续当前操作？</p>
      <DialogClose>关闭</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

## 受控写法

适合路由同步、表单联动、埋点和跨端 blocks。业务状态在外层维护，primitive 只消费契约。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DialogClose, DialogContent, DialogOverlay, DialogRoot, DialogTrigger } from '@varo/primitives-h5'

const open = ref(false)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>打开安全确认</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      <p>当前状态可以同步到 H5 或小程序封装。</p>
      <DialogClose>完成</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>
```

## 小程序封装建议

- `@varo/primitives-weapp` 保持 Vue 写法与契约命名，渲染产物交给 `weapp-vite@6.16.43`
- `wevu@6.16.43` 只作为运行时 peer，不进入 primitives-core
- `weapp-tailwindcss@5.0.6` 可以在业务应用层处理 utility class；primitive 本身仍使用行为契约与 token
- 业务 blocks 应先基于 primitives 定义交互，再由 `@varo/ui-*` 负责视觉样式
