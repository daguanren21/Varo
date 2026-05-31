# InputNumber 数字输入框

## 基础用法

<FormComponentDemo example="input-number" locale="zh" />

## 步进与精度

通过 `step` 控制步进，通过 `precision` 控制小数精度。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 当前值 |
| `min` | `number` | `-Infinity` | 最小值 |
| `max` | `number` | `Infinity` | 最大值 |
| `step` | `number` | `1` | 步进 |
| `precision` | `number` | `undefined` | 小数精度 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
