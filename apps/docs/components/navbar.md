# Navbar 头部导航

## 演示

<PlatformTabsDemo example="navbar" locale="zh" />

## 基础用法

```vue
<template>
  <VNavbar title="订单详情" left-text="返回" right-text="更多" left-arrow />
</template>
```

## Props

| Prop             | 类型      | 默认值      | 描述                 |
| ---------------- | --------- | ----------- | -------------------- |
| `title`          | `string`  | `undefined` | 标题                 |
| `leftText`       | `string`  | `undefined` | 左侧文本             |
| `rightText`      | `string`  | `undefined` | 右侧文本             |
| `leftAriaLabel`  | `string`  | `undefined` | 左侧操作的无障碍名称 |
| `rightAriaLabel` | `string`  | `undefined` | 右侧操作的无障碍名称 |
| `leftArrow`      | `boolean` | `false`     | 是否显示返回箭头     |
| `fixed`          | `boolean` | `false`     | 是否固定在顶部       |
| `placeholder`    | `boolean` | `false`     | 固定时是否占位       |
| `border`         | `boolean` | `true`      | 是否显示底边线       |

## Events

下表 `MouseEvent` 仅适用于 H5；原生 SFC 传递宿主点击事件，不提供浏览器 DOM 事件对象。

| Event        | Payload      | 描述         |
| ------------ | ------------ | ------------ |
| `clickLeft`  | `MouseEvent` | 点击左侧区域 |
| `clickRight` | `MouseEvent` | 点击右侧区域 |

## Slots

| Slot    | 描述           |
| ------- | -------------- |
| `left`  | 自定义左侧区域 |
| `title` | 自定义标题     |
| `right` | 自定义右侧区域 |
