# List

`VList` owns bottom-edge incremental loading. Use [PullRefresh](/en/components/pull-refresh) for top-edge refresh.

## Demo

<ListDemo locale="en" />

## Props

| Prop             | Type      | Default        | Description            |
| ---------------- | --------- | -------------- | ---------------------- |
| `loading`        | `boolean` | `false`        | Loading the next page  |
| `finished`       | `boolean` | `false`        | All records loaded     |
| `disabled`       | `boolean` | `false`        | Disable loading        |
| `immediate`      | `boolean` | `true`         | Request once on mount  |
| `lowerThreshold` | `number`  | `80`           | Early trigger distance |
| `loadingText`    | `string`  | `'加载中'`     | Loading label          |
| `finishedText`   | `string`  | `'没有更多了'` | Completion label       |
| `errorText`      | `string`  | `undefined`    | Retryable error label  |

## Events

| Event   | Payload | Description       |
| ------- | ------- | ----------------- |
| `load`  | `void`  | Request next page |
| `retry` | `void`  | Retry failed load |
