# Toast 轻提示

`VToast` 是 Base Kit 的受控轻提示组件。业务中的队列、全局调用和请求集成应在二次封装层实现。

## 演示

<FormComponentDemo example="toast" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | 是否显示 |
| `message` | `string` | `''` | 提示文案 |
| `type` | `'text' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'text'` | 类型 |
| `position` | `'top' \| 'middle' \| 'bottom'` | `'middle'` | 位置 |
| `closeable` | `boolean` | `true` | 是否显示关闭按钮 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:visible` | `boolean` | 显示状态更新 |
| `close` | `void` | 关闭 |
