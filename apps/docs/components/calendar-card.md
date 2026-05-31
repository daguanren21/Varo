# CalendarCard 日历卡片

## 基础用法

<FormComponentDemo example="calendar-card" locale="zh" />

## 日期范围

通过 `minDate` 和 `maxDate` 控制可选日期范围。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `string` | `undefined` | 当前选中日期 |
| `month` | `string` | 当前月份 | 展示月份，格式 `YYYY-MM` |
| `minDate` | `string` | `undefined` | 最小可选日期 |
| `maxDate` | `string` | `undefined` | 最大可选日期 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string` | 选中日期变化 |
| `select` | `string` | 点击可选日期 |
