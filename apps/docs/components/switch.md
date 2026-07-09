# Switch 开关

`VSwitch` 是 Base Kit 的布尔值切换组件，适合设置项和表单字段。

```vue
<template>
  <VSwitch v-model="enabled" />
  <VSwitch v-model="enabled" disabled />
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 当前值 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中 |
