# Watermark 水印

`VWatermark` 在容器内容上覆盖不可交互、不可访问的重复文本。覆盖层不会截获指针事件，适合文档预览、审批结果与敏感信息展示。

水印仅用于视觉标记，不替代访问控制、内容加密或防篡改机制。

## 演示

<WatermarkDemo locale="zh" />

## Props

| Prop         | 类型               | 默认值      | 描述                             |
| ------------ | ------------------ | ----------- | -------------------------------- |
| `content`    | `string`           | `'Varo'`    | 重复水印文本；空值隐藏           |
| `color`      | `string`           | `'#172033'` | 文本颜色                         |
| `opacity`    | `number`           | `0.12`      | 透明度，限制为 0–1               |
| `rotate`     | `number`           | `-22`       | 旋转角度（deg）                  |
| `fontSize`   | `number`           | `14`        | 字号（px），最小 1               |
| `fontWeight` | `number \| string` | `500`       | 字重                             |
| `gapX`       | `number`           | `160`       | 水平单元宽度（px），最小 24      |
| `gapY`       | `number`           | `96`        | 垂直单元高度（px），最小 24      |
| `offsetX`    | `number`           | `0`         | 水平相位（px），按 `gapX` 归一化 |
| `offsetY`    | `number`           | `0`         | 垂直相位（px），按 `gapY` 归一化 |
| `zIndex`     | `number`           | `9`         | 容器内覆盖层级                   |

平铺行会在高容器中均匀拉伸，保持从顶部到底部都有水印，同时以 `gapY` 作为最小单元高度。

默认插槽承载被水印覆盖的内容。H5 使用 `class` 传入消费者样式；小程序 Registry SFC 使用 `className`。
