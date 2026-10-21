# InputNumber

## Demo

<FormComponentDemo example="input-number" locale="en" />

Default minimum widths are 128px on H5 and 146px in mini programs, where the increment/decrement buttons and numeric input have touch areas at least 44px high. Use `class` or the parent layout to fill the container.

## Decimal

Use `step` for increments and `precision` for decimal formatting.

The mini-program renderer commits on blur: it preserves text while editing, then normalizes the displayed value using `min`, `max`, and `precision`. It corrects out-of-range text even when the accepted number is unchanged, without repeating `update:value` or `change`.

H5 updates numbers during input and adjusts the text on blur to match the accepted number, so out-of-range text does not misrepresent the filter value.

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

`focus` and `blur` below are H5-only DOM events. The native SFC exposes numeric value updates, not browser `FocusEvent` objects.

| Event          | Payload      | Description             |
| -------------- | ------------ | ----------------------- |
| `update:value` | `number`     | Value changed           |
| `change`       | `number`     | Value changed           |
| `focus`        | `FocusEvent` | Input focused (H5 only) |
| `blur`         | `FocusEvent` | Input blurred (H5 only) |
