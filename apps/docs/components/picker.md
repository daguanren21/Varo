# Picker 选择器

## 演示

<FormComponentDemo example="picker" locale="zh" />

## Props

| Prop          | 类型                                 | 默认值      | 描述           |
| ------------- | ------------------------------------ | ----------- | -------------- |
| `visible`     | `boolean`                            | `false`     | 是否展示       |
| `value`       | `string \| number \| Array`          | `undefined` | 当前选中值     |
| `columns`     | `PickerOption[] \| PickerOption[][]` | `[]`        | 单列或多列选项 |
| `title`       | `string`                             | `undefined` | 标题           |
| `confirmText` | `string`                             | `'Confirm'` | 确认文案       |
| `cancelText`  | `string`                             | `'Cancel'`  | 取消文案       |

## Events

| Event            | Payload                           | 描述           |
| ---------------- | --------------------------------- | -------------- |
| `update:value`   | `string \| number \| Array`       | 确认后提交值   |
| `update:visible` | `boolean`                         | 展示状态变化   |
| `change`         | `{ value, option, columnIndex? }` | 草稿选择变化   |
| `confirm`        | `{ value, option }`               | 确认并提交     |
| `cancel`         | `void`                            | 取消并恢复原值 |
