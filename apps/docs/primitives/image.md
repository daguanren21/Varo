# Image

管理图片的加载中、加载完成和错误状态，以及适配方式、尺寸和占位内容。

## 运行时归属

`useImageRoot` 来自 `@varo-ui/headless`。本页 `ImageRoot` 与交互示例仅适用于 `@varo-ui/h5/primitives`，使用 `img` 渲染。原生端使用 Wevu `VImage` SFC 和原生 `image` 元素；原生标签页仅展示源码和支持证据。

## 演示

<PrimitiveExample name="image" locale="zh" />

## Parts

| Part        | 作用                                       |
| ----------- | ------------------------------------------ |
| `ImageRoot` | 图片状态、尺寸、fit 与 loading/error slots |

## 状态与事件

- 状态：`src`、`fit`、`width`、`height`、`round`、`lazyLoad`
- 事件：`load`、`error`、`click`。

::: info 平台差异
两端共用图片状态规则；图片元素、懒加载和 object fit 由各自的运行时实现。
:::
