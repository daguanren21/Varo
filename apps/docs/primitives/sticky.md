# Sticky

吸顶基座：暴露 fixed 状态、偏移量和滚动信息，让 wrapper 只负责视觉。

## 运行时归属

H5 与小程序 adapters 共享状态与事件命名；滚动源由平台实现。

## 演示

<PrimitiveExample name="sticky" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- 筛选栏、分段标题和提交栏经常需要吸顶。
- fixed 状态可驱动边框、阴影和埋点。

## Parts

| Part         | 作用                                |
| ------------ | ----------------------------------- |
| `StickyRoot` | 吸顶定位、fixed slot 状态与滚动事件 |

## 状态与事件

- 状态：`offsetTop`、`zIndex`、`disabled`、`data-fixed`
- 事件：`change`、`scroll`。

## 平台说明

H5 观察 window 滚动；小程序绑定页面或滚动容器。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
