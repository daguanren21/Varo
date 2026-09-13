# InputNumber 数字输入框

## 演示

<FormComponentDemo example="input-number" locale="zh" />

InputNumber 默认使用紧凑的 128px 最小宽度，不会在横向商品行中挤压相邻内容；需要铺满容器时可通过 `class` 或父级布局显式设置宽度。

## 步进与精度

通过 `step` 控制步进，通过 `precision` 控制小数精度。

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
