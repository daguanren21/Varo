# Switch

`VSwitch` is a low-level boolean toggle for settings and form fields.

```vue
<template>
  <VSwitch v-model="enabled" />
  <VSwitch v-model="enabled" disabled />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | Current value |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
