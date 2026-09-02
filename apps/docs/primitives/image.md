# Image

图片状态基座：统一 loading、loaded、error、fit、尺寸和占位内容。

## 运行时归属

`useImageRoot` 来自 `@varo-ui/headless`；H5 使用 img，小程序使用原生 image。

## 演示

<PrimitiveExample name="image" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- 头像、商品图和生成图片都需要稳定的加载与失败状态。
- 占位和错误视觉可由 wrapper 或 slot 决定。

## Parts

| Part        | 作用                                       |
| ----------- | ------------------------------------------ |
| `ImageRoot` | 图片状态、尺寸、fit 与 loading/error slots |

## 状态与事件

- 状态：`src`、`fit`、`width`、`height`、`round`、`lazyLoad`
- 事件：`load`、`error`、`click`。

## 平台说明

状态契约一致；图片元素、懒加载和 object fit 由目标运行时实现。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
