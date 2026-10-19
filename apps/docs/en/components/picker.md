# Picker

## Demo

<FormComponentDemo example="picker" locale="en" />

Columns are separated by a gap. Selected options use a subtle fill and emphasized text; hovering does not imitate selection. The current option remains visible when opening or changing a selection. Native buttons fit their column so confirmation stays fully visible.

## Props

| Prop              | Type                                 | Default     | Description                                     |
| ----------------- | ------------------------------------ | ----------- | ----------------------------------------------- |
| `visible`         | `boolean`                            | `false`     | Whether the picker is visible                   |
| `value`           | `string \| number \| Array`          | `undefined` | Selected value or values                        |
| `columns`         | `PickerOption[] \| PickerOption[][]` | `[]`        | Single or multiple columns                      |
| `title`           | `string`                             | `undefined` | Header title                                    |
| `confirmText`     | `string`                             | `'Confirm'` | Confirm button text                             |
| `cancelText`      | `string`                             | `'Cancel'`  | Cancel button text                              |
| `confirmDisabled` | `boolean`                            | `false`     | Additional domain guard; cancel stays available |

## Events

| Event            | Payload                           | Description                           |
| ---------------- | --------------------------------- | ------------------------------------- |
| `update:value`   | `string \| number \| Array`       | Commit after confirm                  |
| `update:visible` | `boolean`                         | Visibility changed                    |
| `change`         | `{ value, option, columnIndex? }` | Draft selection changed               |
| `confirm`        | `{ value, option }`               | Confirm and commit                    |
| `cancel`         | `void`                            | Cancel and restore the original value |

## Unavailable choices and dynamic columns

Confirmation is disabled when any column is empty, has no enabled options, or its current candidate has been disabled or removed. These states emit no `update:value`, `confirm`, or close event. Column changes re-evaluate the candidates; a disabled option is never used as the default committed value. Cancel remains available, and reopening restores the value supplied by the parent.

Use `confirmDisabled` for constraints spanning several columns. For example, [TimeField](/en/components/time-field) validates the complete `HH:mm` before confirming, in addition to the individual options. Valid selections retain the existing event payloads.
