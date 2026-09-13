# Switch 开关

`VSwitch` 是 Base Kit 的布尔值切换组件，适合设置项和表单字段。

## 演示

<FormComponentDemo example="switch" locale="zh" />

## 动效

Switch 的 thumb 使用 180ms 可逆位移。按住时 thumb 沿切换方向轻微拉伸，松开或快速反向操作会从当前视觉状态返回；减少动态效果时只保留即时位置变化。

## Props

| Prop         | 类型      | 默认值  | 描述   |
| ------------ | --------- | ------- | ------ |
| `modelValue` | `boolean` | `false` | 当前值 |
| `disabled`   | `boolean` | `false` | 禁用   |
| `loading`    | `boolean` | `false` | 加载中 |

## Events

| Event               | Payload   | 描述   |
| ------------------- | --------- | ------ |
| `update:modelValue` | `boolean` | 值更新 |
| `change`            | `boolean` | 值变化 |
