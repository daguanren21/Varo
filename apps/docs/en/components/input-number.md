# InputNumber

## Demo

<FormComponentDemo example="input-number" locale="en" />

InputNumber defaults to a compact 128px minimum width so it does not squeeze adjacent content in horizontal rows. Set width explicitly through `class` or the parent layout when a full-width control is required.

## Decimal

Use `step` for increments and `precision` for decimal formatting.

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

| Event          | Payload      | Description   |
| -------------- | ------------ | ------------- |
| `update:value` | `number`     | Value changed |
| `change`       | `number`     | Value changed |
| `focus`        | `FocusEvent` | Input focused |
| `blur`         | `FocusEvent` | Input blurred |
