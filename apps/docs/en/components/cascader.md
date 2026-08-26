# Cascader

## Demo

<FormComponentDemo example="cascader" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Whether the cascader is visible |
| `value` | `Array<string \| number>` | `[]` | Selected path |
| `options` | `CascaderOption[]` | `[]` | Cascader options |
| `title` | `string` | `undefined` | Header title |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `Array<string \| number>` | Selected path changed |
| `update:visible` | `boolean` | Visibility changed |
| `change` | `{ value, labels, options }` | Selection changed |
| `confirm` | `{ value, labels, options }` | Click confirm |
| `cancel` | `void` | Click cancel |
