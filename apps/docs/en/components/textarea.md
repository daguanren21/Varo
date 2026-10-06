# Textarea

## Demo

<FormComponentDemo example="textarea" locale="en" />

## Props

Textarea reuses the `VInput` props and sets `type="textarea"` internally.

| Prop          | Type               | Default | Description           |
| ------------- | ------------------ | ------- | --------------------- |
| `value`       | `string \| number` | `''`    | Current value         |
| `placeholder` | `string`           | `''`    | Placeholder           |
| `disabled`    | `boolean`          | `false` | Disable textarea      |
| `readonly`    | `boolean`          | `false` | Readonly state        |
| `clearable`   | `boolean`          | `false` | Show clear affordance |

## Events

DOM event types below describe H5 only. Native SFCs use host events, not browser `FocusEvent` / `MouseEvent`; follow the installed SFC contract.

| Event          | Payload      | Description         |
| -------------- | ------------ | ------------------- |
| `update:value` | `string`     | Value changed       |
| `input`        | `string`     | Input value changed |
| `focus`        | `FocusEvent` | Textarea focused    |
| `blur`         | `FocusEvent` | Textarea blurred    |
| `clear`        | `MouseEvent` | Clear value         |
