# Picker

## Basic Usage

<FormComponentDemo example="picker" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Whether the picker is visible |
| `value` | `string \| number` | `undefined` | Selected value |
| `columns` | `PickerOption[]` | `[]` | Option list |
| `title` | `string` | `undefined` | Header title |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string \| number` | Selected value changed |
| `update:visible` | `boolean` | Visibility changed |
| `change` | `{ value, option }` | Selection changed |
| `confirm` | `{ value, option }` | Click confirm |
| `cancel` | `void` | Click cancel |
