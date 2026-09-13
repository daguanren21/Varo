# DateField

Year / month / day columns composed from `VPicker`. Keep the month grid on [Calendar](/en/components/calendar); DateField is not a calendar.

## Demo

<DateFieldDemo locale="en" />

## Props

| Prop          | Type      | Default         | Description               |
| ------------- | --------- | --------------- | ------------------------- |
| `visible`     | `boolean` | `false`         | Whether Picker is shown   |
| `value`       | `string`  | `undefined`     | Current date `YYYY-MM-DD` |
| `placeholder` | `string`  | `'Select date'` | Empty-value label         |
| `disabled`    | `boolean` | `false`         | Disable the field         |
| `readonly`    | `boolean` | `false`         | Make the field read-only  |
| `minYear`     | `number`  | `1970`          | First year                |
| `maxYear`     | `number`  | `2100`          | Last year                 |
| `title`       | `string`  | `undefined`     | Picker title              |
| `confirmText` | `string`  | `'Confirm'`     | Confirm label             |
| `cancelText`  | `string`  | `'Cancel'`      | Cancel label              |

## Events

| Event            | Payload   | Description               |
| ---------------- | --------- | ------------------------- |
| `update:value`   | `string`  | Commit after confirm      |
| `update:visible` | `boolean` | Picker visibility changed |
| `change`         | `string`  | Draft date changed        |
| `confirm`        | `string`  | Confirm and commit        |
| `cancel`         | `void`    | Cancel and preserve value |
