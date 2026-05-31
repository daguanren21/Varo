# DatePicker 日期选择器

## 基础用法

<FormComponentDemo example="date-picker" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 是否展示 |
| `value` | `string` | `undefined` | 当前日期 |
| `month` | `string` | 根据当前值推导 | 展示月份 |
| `confirmText` | `string` | `'Confirm'` | 确认文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string` | 日期变化 |
| `update:visible` | `boolean` | 展示状态变化 |
| `change` | `string` | 选择日期 |
| `confirm` | `string \| undefined` | 点击确认 |
