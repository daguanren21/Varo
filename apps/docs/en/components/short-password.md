# ShortPassword

## Demo

<FormComponentDemo example="short-password" locale="en" />

## Custom Length

Use `length` to set the number of password cells.

## Props

| Prop             | Type     | Default     | Description                            |
| ---------------- | -------- | ----------- | -------------------------------------- |
| `value`          | `string` | `''`        | Current input value                    |
| `length`         | `number` | `6`         | Password length                        |
| `inputAriaLabel` | `string` | `undefined` | Accessible name for the password input |

## Events

`FocusEvent` below describes H5 focus events and does not apply to native hosts. Check the Registry manifest for the component's supported native profiles.

| Event          | Payload      | Description     |
| -------------- | ------------ | --------------- |
| `update:value` | `string`     | Value changed   |
| `complete`     | `string`     | Input completed |
| `focus`        | `FocusEvent` | Input focused   |
| `blur`         | `FocusEvent` | Input blurred   |
