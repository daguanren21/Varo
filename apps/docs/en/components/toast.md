# Toast

`VToast` is a controlled low-level toast component. Queues, global APIs, and request integration belong in secondary wrappers.

## Demo

<FormComponentDemo example="toast" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Visibility |
| `message` | `string` | `''` | Message text |
| `type` | `'text' \| 'success' \| 'warning' \| 'danger' \| 'loading'` | `'text'` | Toast type |
| `position` | `'top' \| 'middle' \| 'bottom'` | `'middle'` | Position |
| `closeable` | `boolean` | `true` | Show close button |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:visible` | `boolean` | Visibility updated |
| `close` | `void` | Closed |
