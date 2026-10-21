# Overlay

管理遮罩的显示、点击关闭、层级、持续时间和滚动锁定。

## 运行时归属

`useOverlayRoot` 来自 `@varo-ui/headless`，只管理平台中立状态。本页 `OverlayRoot` 与交互示例来自 `@varo-ui/h5/primitives`，由 H5 适配层实现 DOM 滚动锁定；headless 不导出此功能。原生端使用 Wevu SFC，标签页仅展示源码和支持证据。

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
H5 可锁定 `body`。原生端没有 `body`，需由业务页面按宿主能力管理滚动；共享的 `lockScroll` 只表达锁定意图，不保证原生页面已锁定。
:::
