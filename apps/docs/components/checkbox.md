# Checkbox 复选按钮

## 基础用法

<FormComponentDemo example="checkbox" locale="zh" />

## 复选组

通过 `VCheckboxGroup` 管理选中值、最大选择数量和排列方向。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `checked` | `boolean` | `undefined` | 单个复选框选中态 |
| `value` | `string \| number \| boolean` | `true` | 复选框值 |
| `label` | `string` | `undefined` | 文案 |
| `disabled` | `boolean` | `false` | 禁用 |

## CheckboxGroup Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `Array<string \| number \| boolean>` | `[]` | 当前选中值 |
| `max` | `number` | `undefined` | 最大选择数量 |
| `direction` | `'horizontal' \| 'vertical'` | `'vertical'` | 排列方向 |
| `disabled` | `boolean` | `false` | 禁用整组 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:checked` | `boolean` | 单个复选框选中态变化 |
| `update:value` | `Array<string \| number \| boolean>` | 复选组选中值变化 |
| `change` | `boolean \| Array<string \| number \| boolean>` | 值变化 |
