# Picker 选择器

## 演示

<FormComponentDemo example="picker" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 是否展示 |
| `value` | `string \| number` | `undefined` | 当前选中值 |
| `columns` | `PickerOption[]` | `[]` | 选项列表 |
| `title` | `string` | `undefined` | 标题 |
| `confirmText` | `string` | `'Confirm'` | 确认文案 |
| `cancelText` | `string` | `'Cancel'` | 取消文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string \| number` | 选中值变化 |
| `update:visible` | `boolean` | 展示状态变化 |
| `change` | `{ value, option }` | 选择变化 |
| `confirm` | `{ value, option }` | 点击确认 |
| `cancel` | `void` | 点击取消 |
