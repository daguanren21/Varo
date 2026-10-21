# Switch

`VSwitch` is a low-level boolean toggle for settings and form fields.

## Demo

<FormComponentDemo example="switch" locale="en" />

::: info Motion
The thumb moves over 180ms and can reverse direction. Holding the control slightly stretches it along its travel direction. On release or rapid reversal, the animation continues from its current visual state toward the new position. With reduced motion enabled, the thumb changes position immediately.
:::

## Props

| Prop         | Type                   | Default | Description                  |
| ------------ | ---------------------- | ------- | ---------------------------- |
| `modelValue` | `boolean`              | `false` | Current value                |
| `disabled`   | `boolean`              | `false` | Disabled state               |
| `loading`    | `boolean`              | `false` | Loading and blocks toggling  |
| `readonly`   | `boolean`              | `false` | Readonly but still focusable |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`  | Control size                 |

## Events

| Event               | Payload   | Description   |
| ------------------- | --------- | ------------- |
| `update:modelValue` | `boolean` | Value updated |
| `change`            | `boolean` | Value changed |
