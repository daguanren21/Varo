# Toast 轻提示

`VToast` 是受控的单条状态反馈，`VToastRegion` 负责多条提示的固定或行内布局。业务队列、自动关闭计时和请求集成仍由调用方持有。

## 演示

<ToastDemo locale="zh" />

## VToast Props

| Prop          | 类型                                                        | 默认值       | 描述               |
| ------------- | ----------------------------------------------------------- | ------------ | ------------------ |
| `visible`     | `boolean`                                                   | `false`      | 是否显示           |
| `message`     | `string`                                                    | `''`         | 提示说明           |
| `title`       | `string`                                                    | —            | 可选标题           |
| `type`        | `'text' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'text'`     | 状态类型           |
| `position`    | `'top' \| 'middle' \| 'bottom'`                             | `'middle'`   | 独立使用时的位置   |
| `actionText`  | `string`                                                    | —            | 可选操作文案       |
| `actionLabel` | `string`                                                    | 操作文案     | 操作按钮无障碍名称 |
| `closeable`   | `boolean`                                                   | `false`      | 是否显示关闭按钮   |
| `closeLabel`  | `string`                                                    | `'关闭通知'` | 关闭按钮无障碍名称 |

## VToastRegion Props

| Prop       | 类型                            | 默认值  | 描述                   |
| ---------- | ------------------------------- | ------- | ---------------------- |
| `position` | `'top' \| 'middle' \| 'bottom'` | `'top'` | 固定区域的位置         |
| `inline`   | `boolean`                       | `false` | 作为普通文档流区域展示 |

## 动效与无障碍

Toast 使用主题 motion token：220ms 进入、160ms 退出、180ms 状态变化。更新同一实例的 `type`、`title` 和 `message` 会在原位置改变状态，不依赖动画结束更新业务状态。`prefers-reduced-motion: reduce` 下移除空间位移。成功和普通反馈使用 `status`，警告和错误使用 `alert`。

## Events

| Event            | Payload   | 描述         |
| ---------------- | --------- | ------------ |
| `update:visible` | `boolean` | 显示状态更新 |
| `close`          | `void`    | 关闭         |
| `action`         | `void`    | 触发可选操作 |
