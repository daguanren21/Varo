# ShortPassword

## Demo

<FormComponentDemo example="short-password" locale="en" />

## Custom Length

Use `length` to control password cell count.

## Props

| Prop             | Type     | Default     | Description                            |
| ---------------- | -------- | ----------- | -------------------------------------- |
| `value`          | `string` | `''`        | Current input value                    |
| `length`         | `number` | `6`         | Password length                        |
| `inputAriaLabel` | `string` | `undefined` | Accessible name for the password input |

## Events

`FocusEvent` below is an H5 contract, not a claim of native profile admission or browser focus events on native hosts. Registry manifests determine native admission.

| Event          | Payload      | Description     |
| -------------- | ------------ | --------------- |
| `update:value` | `string`     | Value changed   |
| `complete`     | `string`     | Input completed |
| `focus`        | `FocusEvent` | Input focused   |
| `blur`         | `FocusEvent` | Input blurred   |
