# Textarea

## Basic Usage

<FormComponentDemo example="textarea" locale="en" />

## Props

Textarea reuses the `VInput` props and sets `type="textarea"` internally.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number` | `''` | Current value |
| `placeholder` | `string` | `''` | Placeholder |
| `disabled` | `boolean` | `false` | Disable textarea |
| `readonly` | `boolean` | `false` | Readonly state |
| `clearable` | `boolean` | `false` | Show clear affordance |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string` | Value changed |
| `input` | `string` | Input value changed |
| `focus` | `FocusEvent` | Textarea focused |
| `blur` | `FocusEvent` | Textarea blurred |
| `clear` | `MouseEvent` | Clear value |
