# Switch 开关

`VSwitch` 是 Base Kit 的布尔值切换组件，适合设置项和表单字段。

## 演示

<FormComponentDemo example="switch" locale="zh" />

::: info 动效
Switch 的滑块在 180ms 内完成位移，移动方向可反转。按住时，滑块沿切换方向轻微拉伸；松开或快速反向操作时，从当前显示状态开始回移。启用减少动态效果后，滑块直接切换位置。
:::

## Props

| Prop         | 类型                   | 默认值  | 描述             |
| ------------ | ---------------------- | ------- | ---------------- |
| `modelValue` | `boolean`              | `false` | 当前值           |
| `disabled`   | `boolean`              | `false` | 禁用             |
| `loading`    | `boolean`              | `false` | 加载中并阻止切换 |
| `readonly`   | `boolean`              | `false` | 只读但仍可聚焦   |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`  | 控件尺寸         |

## Events

| Event               | Payload   | 描述   |
| ------------------- | --------- | ------ |
| `update:modelValue` | `boolean` | 值更新 |
| `change`            | `boolean` | 值变化 |
