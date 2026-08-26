# NumberKeyboard 数字键盘

## 演示

<FormComponentDemo example="number-keyboard" locale="zh" />

## 额外按键

通过 `extraKey` 增加小数点等业务按键。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 是否展示 |
| `extraKey` | `string` | `''` | 额外按键 |
| `deleteText` | `string` | `'Delete'` | 删除文案 |
| `closeText` | `string` | `'Done'` | 完成文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `input` | `string` | 点击数字或额外按键 |
| `delete` | `void` | 点击删除 |
| `close` | `void` | 点击完成 |
