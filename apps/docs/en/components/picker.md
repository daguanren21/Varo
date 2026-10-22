# Picker

## Demo

<FormComponentDemo example="picker" locale="en" />

Columns are separated by a gap. Selected options use a subtle fill and emphasized text; hovering does not imitate selection. The current option remains visible when opening or changing a selection. Native buttons fit their column so confirmation stays fully visible.

## Props

| Prop              | Type                                 | Default     | Description                                                               |
| ----------------- | ------------------------------------ | ----------- | ------------------------------------------------------------------------- |
| `visible`         | `boolean`                            | `false`     | Whether the picker is visible                                             |
| `value`           | `string \| number \| Array`          | `undefined` | Selected value or values                                                  |
| `columns`         | `PickerOption[] \| PickerOption[][]` | `[]`        | Single or multiple columns                                                |
| `title`           | `string`                             | `undefined` | Header title                                                              |
| `confirmText`     | `string`                             | `'Confirm'` | Confirm button text                                                       |
| `cancelText`      | `string`                             | `'Cancel'`  | Cancel button text                                                        |
| `confirmDisabled` | `boolean`                            | `false`     | Disables confirmation for application constraints; cancel stays available |

## Events

| Event            | Payload                           | Description                           |
| ---------------- | --------------------------------- | ------------------------------------- |
| `update:value`   | `string \| number \| Array`       | Commit after confirm                  |
| `update:visible` | `boolean`                         | Visibility changed                    |
| `change`         | `{ value, option, columnIndex? }` | Draft selection changed               |
| `confirm`        | `{ value, option }`               | Confirm and commit                    |
| `cancel`         | `void`                            | Cancel and restore the original value |

## Unavailable choices and dynamic columns

Changing or replacing column data preserves each enabled draft selection, including `0` and `''`. If a draft option is removed or disabled, that column selects its first enabled option while the other columns retain their drafts. These adjustments emit no selection or commit events. Confirmation is disabled when any column is empty or has no enabled options; attempting to confirm emits no `update:value`, `confirm`, or close event.

Until the user selects an option, new column data uses the parent's `value` to determine the selection. Parent `value` changes, cancellation, and closing or reopening the picker restore that value using the current columns. Cancel remains available even when confirmation is disabled.

Use `confirmDisabled` for constraints spanning several columns. For example, [TimeField](/en/components/time-field) validates the complete `HH:mm` before confirming, in addition to the individual options. Valid selections retain the existing event payloads.
