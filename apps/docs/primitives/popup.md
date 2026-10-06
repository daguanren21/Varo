# Popup

弹出层基座：组合遮罩、位置、关闭、安全区与销毁策略。

## 运行时归属

`usePopupRoot` 来自 `@varo-ui/headless`。本页 `PopupRoot` 与交互示例仅属于 `@varo-ui/h5/primitives`；原生端使用独立 Wevu `VPopup` SFC 实现定位和安全区，原生标签页只展示源码/证据。

## 演示

<PrimitiveExample name="popup" locale="zh" />

## Parts

| Part        | 作用                                 |
| ----------- | ------------------------------------ |
| `PopupRoot` | visible 状态、遮罩、内容、关闭与定位 |

## 状态与事件

- 状态：`visible`、`position`、`overlay`、`closeable`、`round`、`destroyOnClose`
- 事件：`update:visible`、`visibleChange`、`close`、`clickOverlay`。

::: info 平台差异
小程序安全区和 H5 viewport 各自适配，公开状态保持一致。
:::
