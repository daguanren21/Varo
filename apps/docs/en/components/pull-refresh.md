# PullRefresh

`VPullRefresh` owns top-edge pull-to-refresh. Keep bottom-edge incremental loading on [List](/en/components/list).

## Demo

<PullRefreshDemo locale="en" />

## Props

| Prop          | Type      | Default      | Description              |
| ------------- | --------- | ------------ | ------------------------ |
| `loading`     | `boolean` | `false`      | Controlled refresh state |
| `disabled`    | `boolean` | `false`      | Disable pull refresh     |
| `threshold`   | `number`  | `64`         | Refresh trigger distance |
| `headHeight`  | `number`  | `48`         | H5-only indicator height |
| `pullText`    | `string`  | `'下拉刷新'` | H5-only pull hint        |
| `releaseText` | `string`  | `'释放刷新'` | H5-only threshold hint   |
| `loadingText` | `string`  | `'加载中'`   | Loading hint             |

## Events

| Event     | Payload | Description                             |
| --------- | ------- | --------------------------------------- |
| `refresh` | `void`  | Released after threshold or native pull |

::: info Platform behavior

- H5 responds to downward drag only at the scroll container's top edge.
- Mini-program uses native `scroll-view` `refresher-*` behavior; `loading` controls completion.
  :::
