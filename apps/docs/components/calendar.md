# Calendar 日历

## 演示

<FormComponentDemo example="calendar" locale="zh" />

## Props

| Prop          | 类型      | 默认值      | 描述                                  |
| ------------- | --------- | ----------- | ------------------------------------- |
| `visible`     | `boolean` | `false`     | 是否展示日历                          |
| `value`       | `string`  | `undefined` | 当前选中日期，格式 `YYYY-MM-DD`       |
| `month`       | `string`  | 当前月份    | 展示月份，格式 `YYYY-MM`              |
| `minDate`     | `string`  | `undefined` | 最小可选日期（含），格式 `YYYY-MM-DD` |
| `maxDate`     | `string`  | `undefined` | 最大可选日期（含），格式 `YYYY-MM-DD` |
| `confirmText` | `string`  | `'Confirm'` | 确认按钮文案                          |

范围外的日期不可选择。如果传入的 `value` 超出范围，或范围变化后当前选择不再有效，日历保留该值且不触发选择或值更新事件，但会禁用确认。选择范围内的日期、传入有效的 `value`，或调整范围使当前选择有效后，才能确认。省略某个边界表示该方向不受限制。

## Events

| Event            | Payload               | 描述         |
| ---------------- | --------------------- | ------------ |
| `update:visible` | `boolean`             | 展示状态变化 |
| `update:value`   | `string`              | 选中日期变化 |
| `select`         | `string`              | 选择日期     |
| `confirm`        | `string \| undefined` | 点击确认     |
