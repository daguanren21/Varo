# Sticky

## 演示

<PlatformTabsDemo example="sticky" locale="zh" />

## 基础用法

```vue
<template>
  <VSticky>
    <div class="sticky-bar">
      吸顶区域
    </div>
  </VSticky>
</template>
```

## 顶部偏移

```vue
<template>
  <VSticky :offset-top="12" :z-index="10">
    <div class="sticky-bar">
      距离顶部 12px
    </div>
  </VSticky>
</template>
```

## 监听状态

```vue
<template>
  <VSticky @change="fixed => console.log(fixed)" @scroll="event => console.log(event)">
    <div class="sticky-bar">
      吸顶区域
    </div>
  </VSticky>
</template>
```

## Props

| Prop        | 类型               | 默认值      | 描述                 |
| ----------- | ------------------ | ----------- | -------------------- |
| `offsetTop` | `number \| string` | `0`         | 吸顶时距离顶部的距离 |
| `zIndex`    | `number \| string` | `undefined` | 层级                 |
| `disabled`  | `boolean`          | `false`     | 是否禁用吸顶行为     |

## Events

| Event    | Payload                                   | 描述           |
| -------- | ----------------------------------------- | -------------- |
| `change` | `boolean`                                 | 固定状态变化   |
| `scroll` | `{ isFixed: boolean; scrollTop: number }` | 页面滚动时触发 |

## Slots

| Slot      | 描述                              |
| --------- | --------------------------------- |
| `default` | 吸顶内容，slot props 包含 `fixed` |

::: info Primitives
`Sticky` 的滚动状态和事件在 H5 由 `StickyRoot` 管理，原生端使用 Wevu Registry SFC。`Divider`、`Grid`、`Layout`、`Space` 是静态布局组件，直接在 UI 层实现。
:::
