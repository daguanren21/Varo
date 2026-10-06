# Sticky

吸顶基座：暴露 fixed 状态、偏移量和滚动信息，让 wrapper 只负责视觉。

## 运行时归属

本页 `StickyRoot` 与交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu `VSticky` SFC，不提供等价 Vue Parts；原生标签页只展示源码/证据。各自运行时负责真实滚动源。

## 演示

<PrimitiveExample name="sticky" locale="zh" />

## Parts

| Part         | 作用                                |
| ------------ | ----------------------------------- |
| `StickyRoot` | 吸顶定位、fixed slot 状态与滚动事件 |

## 状态与事件

- 状态：`offsetTop`、`zIndex`、`disabled`、`data-fixed`
- 事件：`change`、`scroll`。

::: info 平台差异
H5 观察 window 滚动；小程序绑定页面或滚动容器。
:::
