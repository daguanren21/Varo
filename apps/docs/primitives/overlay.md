# Overlay

遮罩基座：统一 visible、点击关闭、层级、持续时间与滚动锁定。

## 运行时归属

`useOverlayRoot` 来自 `@varo-ui/headless`，只管理中立状态。DOM 滚动锁定属于 H5 适配层，不由 headless 导出。本页 `OverlayRoot` 与交互示例仅属于 `@varo-ui/h5/primitives`；原生端使用 Wevu SFC，标签页只展示源码/证据。

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
H5 可锁定 `body`；原生端没有 `body`，需要由业务页面按宿主能力管理滚动，不能把共享 `lockScroll` 意图当作原生页面已锁定的证明。
:::
