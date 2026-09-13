# Switch

`VSwitch` is a low-level boolean toggle for settings and form fields.

## Demo

<FormComponentDemo example="switch" locale="en" />

::: info Motion
The thumb uses a reversible 180ms translation. Holding the control briefly stretches the thumb along its travel direction; release or rapid reversal retargets from the current visual state. Reduced motion keeps only the immediate position change.
:::

## Props

| Prop         | Type      | Default | Description    |
| ------------ | --------- | ------- | -------------- |
| `modelValue` | `boolean` | `false` | Current value  |
| `disabled`   | `boolean` | `false` | Disabled state |
| `loading`    | `boolean` | `false` | Loading state  |

## Events

| Event               | Payload   | Description   |
| ------------------- | --------- | ------------- |
| `update:modelValue` | `boolean` | Value updated |
| `change`            | `boolean` | Value changed |
