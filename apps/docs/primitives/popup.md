# Popup

弹出层基座：组合遮罩、位置、关闭、安全区与销毁策略。

## 运行时归属

`usePopupRoot` 来自 `@varo-ui/headless`；H5 与小程序分别实现定位和安全区。

## 演示

<PrimitiveExample name="popup" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- 底部面板、抽屉和操作面板共享相同 visible 契约。
- position 与 overlay 解耦后可支撑更多 UI wrapper。

## Parts

| Part        | 作用                                 |
| ----------- | ------------------------------------ |
| `PopupRoot` | visible 状态、遮罩、内容、关闭与定位 |

## 状态与事件

- 状态：`visible`、`position`、`overlay`、`closeable`、`round`、`destroyOnClose`
- 事件：`update:visible`、`visibleChange`、`close`、`clickOverlay`。

## 平台说明

小程序安全区和 H5 viewport 各自适配，公开状态保持一致。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
