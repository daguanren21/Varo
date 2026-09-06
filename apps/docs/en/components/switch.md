# Switch

`VSwitch` is a low-level boolean toggle for settings and form fields.

<RegistryInstallStrip item="components/switch" :targets="['h5', 'weapp']" locale="en" />

## Demo

<FormComponentDemo example="switch" locale="en" />

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
