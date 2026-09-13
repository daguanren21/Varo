# Image

图片状态基座：统一 loading、loaded、error、fit、尺寸和占位内容。

## 运行时归属

`useImageRoot` 来自 `@varo-ui/headless`；H5 使用 img，小程序使用原生 image。

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
状态契约一致；图片元素、懒加载和 object fit 由目标运行时实现。
:::
