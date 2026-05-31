# Calendar 日历

## 基础用法

<FormComponentDemo example="calendar" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 是否展示日历 |
| `value` | `string` | `undefined` | 当前选中日期 |
| `month` | `string` | 当前月份 | 展示月份，格式 `YYYY-MM` |
| `confirmText` | `string` | `'Confirm'` | 确认按钮文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:visible` | `boolean` | 展示状态变化 |
| `update:value` | `string` | 选中日期变化 |
| `select` | `string` | 选择日期 |
| `confirm` | `string \| undefined` | 点击确认 |
