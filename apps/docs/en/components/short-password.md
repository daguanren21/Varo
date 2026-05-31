# ShortPassword

## Basic Usage

<FormComponentDemo example="short-password" locale="en" />

## Custom Length

Use `length` to control password cell count.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `''` | Current input value |
| `length` | `number` | `6` | Password length |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string` | Value changed |
| `complete` | `string` | Input completed |
| `focus` | `FocusEvent` | Input focused |
| `blur` | `FocusEvent` | Input blurred |
