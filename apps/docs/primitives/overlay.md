# Overlay

遮罩基座：统一 visible、点击关闭、层级、持续时间与滚动锁定。

## 运行时归属

`useOverlayRoot` 和滚动锁定来自 `@varo-ui/headless`，目标 adapter 负责真实页面锁定。

## 演示

<PrimitiveExample name="overlay" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- Popup、抽屉和模态层都需要同一遮罩行为。
- 独立 Overlay 可避免每个浮层重复关闭逻辑。

## Parts

| Part          | 作用                       |
| ------------- | -------------------------- |
| `OverlayRoot` | 可见态、点击关闭与滚动锁定 |

## 状态与事件

- 状态：`visible`、`defaultVisible`、`lockScroll`、`closeOnClickOverlay`
- 事件：`update:visible`、`visibleChange`、`close`、`click`。

## 平台说明

H5 锁定 body；小程序按页面能力处理滚动。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
