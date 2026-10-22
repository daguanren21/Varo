# Popup

组合弹出层的遮罩、位置、关闭行为、安全区和销毁策略。

## 运行时归属

`usePopupRoot` 来自 `@varo-ui/headless`。本页 `PopupRoot` 与交互示例仅适用于 `@varo-ui/h5/primitives`。原生端使用独立的 Wevu `VPopup` SFC 处理定位和安全区；原生标签页仅展示源码和支持证据。

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
两端公开状态一致，分别适配小程序安全区和 H5 视口。
:::
