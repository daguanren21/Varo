# Picker

## Demo

<FormComponentDemo example="picker" locale="en" />

## Props

| Prop          | Type                                 | Default     | Description                   |
| ------------- | ------------------------------------ | ----------- | ----------------------------- |
| `visible`     | `boolean`                            | `false`     | Whether the picker is visible |
| `value`       | `string \| number \| Array`          | `undefined` | Selected value or values      |
| `columns`     | `PickerOption[] \| PickerOption[][]` | `[]`        | Single or multiple columns    |
| `title`       | `string`                             | `undefined` | Header title                  |
| `confirmText` | `string`                             | `'Confirm'` | Confirm button text           |
| `cancelText`  | `string`                             | `'Cancel'`  | Cancel button text            |

## Events

| Event            | Payload                           | Description                           |
| ---------------- | --------------------------------- | ------------------------------------- |
| `update:value`   | `string \| number \| Array`       | Commit after confirm                  |
| `update:visible` | `boolean`                         | Visibility changed                    |
| `change`         | `{ value, option, columnIndex? }` | Draft selection changed               |
| `confirm`        | `{ value, option }`               | Confirm and commit                    |
| `cancel`         | `void`                            | Cancel and restore the original value |
