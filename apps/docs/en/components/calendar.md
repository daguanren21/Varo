# Calendar

## Demo

<FormComponentDemo example="calendar" locale="en" />

## Props

| Prop          | Type      | Default       | Description                                                    |
| ------------- | --------- | ------------- | -------------------------------------------------------------- |
| `visible`     | `boolean` | `false`       | Whether the calendar is visible                                |
| `value`       | `string`  | `undefined`   | Selected date, formatted as `YYYY-MM-DD`                       |
| `month`       | `string`  | Current month | Displayed month, formatted as `YYYY-MM`                        |
| `minDate`     | `string`  | `undefined`   | Earliest selectable date, inclusive, formatted as `YYYY-MM-DD` |
| `maxDate`     | `string`  | `undefined`   | Latest selectable date, inclusive, formatted as `YYYY-MM-DD`   |
| `confirmText` | `string`  | `'Confirm'`   | Confirm button text                                            |

Dates outside the bounds cannot be selected. If the supplied `value` is out of range, or updated bounds exclude the current selection, the calendar retains the value without emitting selection or value updates and disables confirmation. Confirmation becomes available after selecting an allowed date, supplying a valid `value`, or changing the bounds to include the current selection. Omitting a bound leaves that direction unrestricted.

## Events

| Event            | Payload               | Description           |
| ---------------- | --------------------- | --------------------- |
| `update:visible` | `boolean`             | Visibility changed    |
| `update:value`   | `string`              | Selected date changed |
| `select`         | `string`              | Select a date         |
| `confirm`        | `string \| undefined` | Click confirm         |
