# Drawer

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <VButton @click="open = true">
    打开抽屉
  </VButton>
  <VDrawer v-model:open="open" closeable>
    <h2>筛选条件</h2>
    <p>抽屉内容保持在当前页面上下文中。</p>
  </VDrawer>
</template>
```

## 方向与遮罩

```vue
<template>
  <VDrawer v-model:open="open" placement="left" round>
    左侧内容
  </VDrawer>
  <VDrawer v-model:open="open" placement="bottom" :close-on-click-overlay="false">
    底部内容
  </VDrawer>
</template>
```

## Props

| Prop                  | 类型                                     | 默认值      | 描述                                             |
| --------------------- | ---------------------------------------- | ----------- | ------------------------------------------------ |
| `open`                | `boolean \| undefined`                   | `undefined` | 受控打开状态                                     |
| `defaultOpen`         | `boolean`                                | `false`     | 非受控初始状态                                   |
| `ariaLabel`           | `string`                                 | `undefined` | 应用于实际 dialog 的可访问名称；省略时保留原行为 |
| `placement`           | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'`   | 抽屉方向                                         |
| `overlay`             | `boolean`                                | `true`      | 是否显示遮罩                                     |
| `closeable`           | `boolean`                                | `false`     | 是否显示关闭按钮                                 |
| `closeIcon`           | `string`                                 | `'×'`       | 关闭按钮内容                                     |
| `round`               | `boolean`                                | `false`     | 是否使用方向对应的圆角                           |
| `safeAreaInsetBottom` | `boolean`                                | `false`     | 是否增加底部安全区                               |
| `lockScroll`          | `boolean`                                | `true`      | H5 是否锁定页面滚动                              |
| `closeOnClickOverlay` | `boolean`                                | `true`      | 点击遮罩是否关闭                                 |
| `disabled`            | `boolean`                                | `false`     | 禁止打开和关闭                                   |
| `zIndex`              | `number \| string`                       | `undefined` | 自定义层级                                       |

## Events

| Event          | Payload                                                 | 描述                         |
| -------------- | ------------------------------------------------------- | ---------------------------- |
| `update:open`  | `boolean`                                               | 请求未取消时触发一次         |
| `openChange`   | H5: `(open, details)`；Wevu: `[open, details]` 单个元组 | 状态写入前的同步、可取消请求 |
| `close`        | `undefined`                                             | 关闭请求未取消时触发一次     |
| `clickOverlay` | `undefined`                                             | 点击遮罩                     |

`openChange` 先于内部状态写入、`update:open` 和 `close`。在该处理器返回前同步调用 `details.cancel()`，本次请求就不会写入非受控状态，也不会发出后两类事件；不要等 `await` 后再取消。`details.reason` 使用 headless 的 `DialogOpenChangeDetails` 契约。禁用状态和与当前状态相同的请求不产生变化事件。

受控模式下，接受请求仍需父组件应用新的 `open` prop 才改变显示；取消请求不阻止父组件随后独立修改 prop。`clickOverlay` 只是点击通知，不表示关闭已经接受。

Wevu 原生事件只有一个 `detail` 载荷，接收函数需解构元组；不要按 Vue 的两个独立参数接收。`update:open` 仍是单个布尔值：

```ts
import type { DialogOpenChangeDetails } from '@varo-ui/headless'

function onNativeOpenChange([open, details]: [boolean, DialogOpenChangeDetails]) {
  if (!open) { details.cancel() } // 此示例阻止关闭
}
```

将该函数绑定到原生 SFC 的 `@open-change`。仓库 `web-preview` 的基础交互场景包含可操作的取消/允许关闭流程，运行的是实际编译产物。

::: info 交互
H5 支持 Escape 关闭、焦点进入抽屉、Tab 循环和关闭后返回触发按钮；使用外部按钮控制 `open`、未渲染 `DrawerTrigger` 时，也会恢复到打开前获得焦点的元素。Weapp 使用原生触摸点击路径，不绑定浏览器文档键盘监听。
:::
