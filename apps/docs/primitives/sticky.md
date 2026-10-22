# Sticky

提供吸顶状态、偏移量和滚动信息，外层组件负责样式。

## 运行时归属

本页 `StickyRoot` 与交互示例仅适用于 `@varo-ui/h5/primitives`。原生端使用 Wevu `VSticky` SFC，没有对应的 Vue Parts；原生标签页仅展示源码和支持证据。各运行时分别连接实际滚动源。

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
