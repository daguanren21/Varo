# Switch 开关

`VSwitch` 是 Base Kit 的布尔值切换组件，适合设置项和表单字段。

## 演示

<FormComponentDemo example="switch" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 当前值 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:modelValue` | `boolean` | 值更新 |
| `change` | `boolean` | 值变化 |
