# Calendar

## Basic Usage

<FormComponentDemo example="calendar" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Whether the calendar is visible |
| `value` | `string` | `undefined` | Selected date |
| `month` | `string` | Current month | Displayed month, formatted as `YYYY-MM` |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:visible` | `boolean` | Visibility changed |
| `update:value` | `string` | Selected date changed |
| `select` | `string` | Select a date |
| `confirm` | `string \| undefined` | Click confirm |
