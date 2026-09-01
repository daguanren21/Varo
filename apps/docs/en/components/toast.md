# Toast

`VToast` is a controlled low-level toast component. Queues, global APIs, and request integration belong in secondary wrappers.

## Demo

<FormComponentDemo example="toast" locale="en" />

## Props

| Prop         | Type                                                        | Default      | Description                          |
| ------------ | ----------------------------------------------------------- | ------------ | ------------------------------------ |
| `visible`    | `boolean`                                                   | `false`      | Visibility                           |
| `message`    | `string`                                                    | `''`         | Message text                         |
| `type`       | `'text' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'text'`     | Toast type                           |
| `position`   | `'top' \| 'middle' \| 'bottom'`                             | `'middle'`   | Position                             |
| `closeable`  | `boolean`                                                   | `true`       | Show close button                    |
| `closeLabel` | `string`                                                    | `'关闭通知'` | Accessible name for the close button |

## Motion and accessibility

Toast uses a 220ms entrance and 160ms exit transition with position-aware movement. Under `prefers-reduced-motion: reduce`, it falls back to an immediate opacity change. Success and neutral feedback use `status`; warnings and errors use `alert`.

## Events

| Event            | Payload   | Description        |
| ---------------- | --------- | ------------------ |
| `update:visible` | `boolean` | Visibility updated |
| `close`          | `void`    | Closed             |
