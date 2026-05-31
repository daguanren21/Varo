# DatePicker

## Basic Usage

<FormComponentDemo example="date-picker" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Whether the picker is visible |
| `value` | `string` | `undefined` | Selected date |
| `month` | `string` | Derived from current value | Displayed month |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string` | Date changed |
| `update:visible` | `boolean` | Visibility changed |
| `change` | `string` | Select a date |
| `confirm` | `string \| undefined` | Click confirm |
