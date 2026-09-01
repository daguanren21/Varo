# Toast 轻提示

`VToast` 是 Base Kit 的受控轻提示组件。业务中的队列、全局调用和请求集成应在二次封装层实现。

## 演示

<FormComponentDemo example="toast" locale="zh" />

## Props

| Prop         | 类型                                                        | 默认值       | 描述                 |
| ------------ | ----------------------------------------------------------- | ------------ | -------------------- |
| `visible`    | `boolean`                                                   | `false`      | 是否显示             |
| `message`    | `string`                                                    | `''`         | 提示文案             |
| `type`       | `'text' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'text'`     | 类型                 |
| `position`   | `'top' \| 'middle' \| 'bottom'`                             | `'middle'`   | 位置                 |
| `closeable`  | `boolean`                                                   | `true`       | 是否显示关闭按钮     |
| `closeLabel` | `string`                                                    | `'关闭通知'` | 关闭按钮的无障碍名称 |

## 动效与无障碍

Toast 使用 220ms 进入和 160ms 退出过渡；顶部、居中和底部位置采用对应方向的轻量位移。`prefers-reduced-motion: reduce` 下仅保留即时淡入淡出。成功和普通反馈使用 `status`，警告和错误使用 `alert`。

## Events

| Event            | Payload   | 描述         |
| ---------------- | --------- | ------------ |
| `update:visible` | `boolean` | 显示状态更新 |
| `close`          | `void`    | 关闭         |
