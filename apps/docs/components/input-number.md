# InputNumber 数字输入框

## 演示

<FormComponentDemo example="input-number" locale="zh" />

H5 默认使用紧凑的 128px 最小宽度；小程序端最小宽度为 146px，为加减按钮与数值输入保留至少 44px 高的触控区。需要铺满容器时可通过 `class` 或父级布局显式设置宽度。

## 步进与精度

通过 `step` 控制步进，通过 `precision` 控制小数精度。

小程序端在失焦时提交数值：编辑时保留输入文本，提交后按 `min`、`max` 和 `precision` 归一化显示。即使归一化后的数值未改变，也会纠正越界文本；不会重复触发 `update:value` 或 `change`。

H5 保留输入时的数值更新行为，并在失焦后将显示文本与已接受的数值重新对齐，避免越界文本与实际筛选值不一致。

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
