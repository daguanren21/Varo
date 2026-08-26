# ShortPassword 短密码

## 演示

<FormComponentDemo example="short-password" locale="zh" />

## 自定义长度

通过 `length` 控制密码位数。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `string` | `''` | 当前输入值 |
| `length` | `number` | `6` | 密码位数 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string` | 输入值变化 |
| `complete` | `string` | 输入完成 |
| `focus` | `FocusEvent` | 聚焦 |
| `blur` | `FocusEvent` | 失焦 |
