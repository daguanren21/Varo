# Overlay

遮罩基座：统一 visible、点击关闭、层级、持续时间与滚动锁定。

## 运行时归属

`useOverlayRoot` 和滚动锁定来自 `@varo-ui/headless`，目标 adapter 负责真实页面锁定。

## 演示

<PrimitiveExample name="overlay" locale="zh" />

## Parts

| Part          | 作用                       |
| ------------- | -------------------------- |
| `OverlayRoot` | 可见态、点击关闭与滚动锁定 |

## 状态与事件

- 状态：`visible`、`defaultVisible`、`lockScroll`、`closeOnClickOverlay`
- 事件：`update:visible`、`visibleChange`、`close`、`click`。

::: info 平台差异
H5 锁定 body；小程序按页面能力处理滚动。
:::
