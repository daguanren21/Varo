# Toast

`VToast` owns one controlled status message. `VToastRegion` lays out multiple notifications in a fixed or inline region. The caller still owns queue state, auto-dismiss timers, and request integration.

## Demo

<ToastDemo locale="en" />

## VToast Props

| Prop          | Type                                                        | Default      | Description                   |
| ------------- | ----------------------------------------------------------- | ------------ | ----------------------------- |
| `visible`     | `boolean`                                                   | `false`      | Whether the toast is visible  |
| `message`     | `string`                                                    | `''`         | Supporting message            |
| `title`       | `string`                                                    | —            | Optional title                |
| `type`        | `'text' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'text'`     | Status type                   |
| `position`    | `'top' \| 'middle' \| 'bottom'`                             | `'middle'`   | Position when used standalone |
| `actionText`  | `string`                                                    | —            | Optional action label         |
| `actionLabel` | `string`                                                    | action text  | Accessible action name        |
| `closeable`   | `boolean`                                                   | `false`      | Show the close button         |
| `closeLabel`  | `string`                                                    | `'关闭通知'` | Accessible close name         |

## VToastRegion Props

| Prop       | Type                            | Default | Description                    |
| ---------- | ------------------------------- | ------- | ------------------------------ |
| `position` | `'top' \| 'middle' \| 'bottom'` | `'top'` | Fixed-region position          |
| `inline`   | `boolean`                       | `false` | Render in normal document flow |

::: info Motion and accessibility
Toast motion resolves through theme tokens: 220ms enter, 160ms exit, and 180ms status changes. Updating `type`, `title`, and `message` on the same instance changes its status in place; product state never depends on animation completion. Under `prefers-reduced-motion: reduce`, spatial movement is removed. Success and neutral feedback use `status`; warning and danger use `alert`.
:::

## Events

| Event            | Payload   | Description               |
| ---------------- | --------- | ------------------------- |
| `update:visible` | `boolean` | Visibility update         |
| `close`          | `void`    | Dismissed                 |
| `action`         | `void`    | Optional action activated |
