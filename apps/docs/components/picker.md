# Picker 选择器

## 演示

<FormComponentDemo example="picker" locale="zh" />

多列之间保留间距；选中项使用浅底色和文字强调，悬停不会显示选中样式。打开或更新选择时，当前选项保持可见。原生按钮宽度随所在列变化，确认操作不会被裁切。

## Props

| Prop              | 类型                                 | 默认值      | 描述                             |
| ----------------- | ------------------------------------ | ----------- | -------------------------------- |
| `visible`         | `boolean`                            | `false`     | 是否展示                         |
| `value`           | `string \| number \| Array`          | `undefined` | 当前选中值                       |
| `columns`         | `PickerOption[] \| PickerOption[][]` | `[]`        | 单列或多列选项                   |
| `title`           | `string`                             | `undefined` | 标题                             |
| `confirmText`     | `string`                             | `'Confirm'` | 确认文案                         |
| `cancelText`      | `string`                             | `'Cancel'`  | 取消文案                         |
| `confirmDisabled` | `boolean`                            | `false`     | 领域约束额外禁用确认，不影响取消 |

## Events

| Event            | Payload                           | 描述           |
| ---------------- | --------------------------------- | -------------- |
| `update:value`   | `string \| number \| Array`       | 确认后提交值   |
| `update:visible` | `boolean`                         | 展示状态变化   |
| `change`         | `{ value, option, columnIndex? }` | 草稿选择变化   |
| `confirm`        | `{ value, option }`               | 确认并提交     |
| `cancel`         | `void`                            | 取消并恢复原值 |

## 无有效选项与动态列

任意一列为空、没有可用选项，或当前候选已被禁用/移除时，确认按钮不可用，也不会发送 `update:value`、`confirm` 或关闭事件。列数据变化后会重新计算候选；禁用选项不会作为默认选中值提交。取消仍可使用，关闭后重新打开会恢复父级传入的值。

`confirmDisabled` 用于组合组件的跨列约束。例如 [TimeField](/components/time-field) 在确认前校验完整的 `HH:mm`，而不只检查每列是否存在选项。普通有效选择的事件结构保持不变。
