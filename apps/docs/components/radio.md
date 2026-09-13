# Radio 单选按钮

## 演示

<FormComponentDemo example="radio" locale="zh" />

## 选中反馈

Radio 始终保留内点节点，选中时使用 180ms scale/fade 显示 Varo 主色内点，避免切换时布局重建。按压仅提供短促缩放；减少动态效果时状态即时切换。

## Props

| Prop       | 类型                          | 默认值      | 描述             |
| ---------- | ----------------------------- | ----------- | ---------------- |
| `checked`  | `boolean`                     | `undefined` | 单个单选框选中态 |
| `value`    | `string \| number \| boolean` | 必填        | 单选框值         |
| `label`    | `string`                      | `undefined` | 文案             |
| `disabled` | `boolean`                     | `false`     | 禁用             |

## RadioGroup Props

| Prop        | 类型                          | 默认值       | 描述       |
| ----------- | ----------------------------- | ------------ | ---------- |
| `value`     | `string \| number \| boolean` | `undefined`  | 当前选中值 |
| `direction` | `'horizontal' \| 'vertical'`  | `'vertical'` | 排列方向   |
| `disabled`  | `boolean`                     | `false`      | 禁用整组   |
