# InputNumber

## Demo

<FormComponentDemo example="input-number" locale="en" />

H5 defaults to a compact 128px minimum width. The mini-program renderer uses a 146px minimum width, retaining touch areas at least 44px high for the increment/decrement buttons and numeric input. Set width explicitly through `class` or the parent layout when a full-width control is required.

## Decimal

Use `step` for increments and `precision` for decimal formatting.

The mini-program renderer commits on blur: it preserves text while editing, then normalizes the displayed value using `min`, `max`, and `precision`. It corrects out-of-range text even when the accepted number is unchanged, without repeating `update:value` or `change`.

H5 retains its input-time numeric updates and reconciles the displayed text with the accepted number after blur, preventing out-of-range text from disagreeing with the actual filter value.

## Props

| Prop                | Type      | Default            | Description                              |
| ------------------- | --------- | ------------------ | ---------------------------------------- |
| `decreaseAriaLabel` | `string`  | `'Decrease value'` | Accessible name for the decrement button |
| `increaseAriaLabel` | `string`  | `'Increase value'` | Accessible name for the increment button |
| `inputAriaLabel`    | `string`  | `'Numeric value'`  | Accessible name for the numeric input    |
| `value`             | `number`  | `0`                | Current value                            |
| `min`               | `number`  | `-Infinity`        | Minimum value                            |
| `max`               | `number`  | `Infinity`         | Maximum value                            |
| `step`              | `number`  | `1`                | Step value                               |
| `precision`         | `number`  | `undefined`        | Decimal precision                        |
| `disabled`          | `boolean` | `false`            | Disable component                        |
| `readonly`          | `boolean` | `false`            | Readonly state                           |

## Events

| Event          | Payload      | Description             |
| -------------- | ------------ | ----------------------- |
| `update:value` | `number`     | Value changed           |
| `change`       | `number`     | Value changed           |
| `focus`        | `FocusEvent` | Input focused (H5 only) |
| `blur`         | `FocusEvent` | Input blurred (H5 only) |
