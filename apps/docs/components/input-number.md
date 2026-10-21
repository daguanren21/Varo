# InputNumber 数字输入框

## 演示

<FormComponentDemo example="input-number" locale="zh" />

H5 默认最小宽度为 128px，小程序端为 146px。小程序的加减按钮和数值输入区均保留至少 44px 的触控高度。需要铺满容器时，可通过 `class` 或父级布局设置宽度。

## 步进与精度

通过 `step` 控制步进，通过 `precision` 控制小数精度。

小程序端在失焦时提交数值：编辑时保留输入文本，提交后按 `min`、`max` 和 `precision` 归一化显示。即使归一化后的数值未改变，也会纠正越界文本；不会重复触发 `update:value` 或 `change`。

H5 在输入时更新数值，失焦后将显示文本调整为已接受的数值，避免越界文本与实际筛选值不一致。

## Props

| Prop                | 类型      | 默认值             | 描述                   |
| ------------------- | --------- | ------------------ | ---------------------- |
| `decreaseAriaLabel` | `string`  | `'Decrease value'` | 减少按钮的可访问名称   |
| `increaseAriaLabel` | `string`  | `'Increase value'` | 增加按钮的可访问名称   |
| `inputAriaLabel`    | `string`  | `'Numeric value'`  | 数值输入框的可访问名称 |
| `value`             | `number`  | `0`                | 当前值                 |
| `min`               | `number`  | `-Infinity`        | 最小值                 |
| `max`               | `number`  | `Infinity`         | 最大值                 |
| `step`              | `number`  | `1`                | 步进                   |
| `precision`         | `number`  | `undefined`        | 小数精度               |
| `disabled`          | `boolean` | `false`            | 禁用                   |
| `readonly`          | `boolean` | `false`            | 只读                   |
