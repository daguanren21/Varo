# Radio

## Demo

<FormComponentDemo example="radio" locale="en" />

## Selection feedback

Radio keeps its inner dot mounted. When selected, the dot appears in Varo's primary color with a 180ms scale and fade animation, avoiding layout reconstruction between states. Pressing briefly scales the control; with reduced motion enabled, the state changes immediately.

## Props

| Prop       | Type                          | Default     | Description                        |
| ---------- | ----------------------------- | ----------- | ---------------------------------- |
| `checked`  | `boolean`                     | `undefined` | Checked state for standalone usage |
| `value`    | `string \| number \| boolean` | Required    | Radio value                        |
| `label`    | `string`                      | `undefined` | Label text                         |
| `disabled` | `boolean`                     | `false`     | Disable radio                      |

## RadioGroup Props

| Prop        | Type                          | Default      | Description       |
| ----------- | ----------------------------- | ------------ | ----------------- |
| `value`     | `string \| number \| boolean` | `undefined`  | Selected value    |
| `direction` | `'horizontal' \| 'vertical'`  | `'vertical'` | Layout direction  |
| `disabled`  | `boolean`                     | `false`      | Disable the group |

## Events

| Event            | Payload                       | Description           |
| ---------------- | ----------------------------- | --------------------- |
| `update:checked` | `boolean`                     | Checked state changed |
| `update:value`   | `string \| number \| boolean` | Group value changed   |
| `change`         | `string \| number \| boolean` | Value changed         |
