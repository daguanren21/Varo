# Cascader 级联选择器

## 演示

<FormComponentDemo example="cascader" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 是否展示 |
| `value` | `Array<string \| number>` | `[]` | 当前选中路径 |
| `options` | `CascaderOption[]` | `[]` | 级联选项 |
| `title` | `string` | `undefined` | 标题 |
| `confirmText` | `string` | `'Confirm'` | 确认文案 |
| `cancelText` | `string` | `'Cancel'` | 取消文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `Array<string \| number>` | 选中路径变化 |
| `update:visible` | `boolean` | 展示状态变化 |
| `change` | `{ value, labels, options }` | 选择项变化 |
| `confirm` | `{ value, labels, options }` | 点击确认 |
| `cancel` | `void` | 点击取消 |
