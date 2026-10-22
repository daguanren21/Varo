# List 列表加载

`VList` 用于列表触底或上拉时加载更多内容。顶部下拉刷新请使用 [PullRefresh](/components/pull-refresh)。

## 演示

<ComponentPlatformDemo component="list" locale="zh">
  <ListDemo locale="zh" />
</ComponentPlatformDemo>

## Props

| Prop             | 类型      | 默认值         | 描述           |
| ---------------- | --------- | -------------- | -------------- |
| `loading`        | `boolean` | `false`        | 正在加载       |
| `finished`       | `boolean` | `false`        | 已加载全部数据 |
| `disabled`       | `boolean` | `false`        | 禁止加载       |
| `immediate`      | `boolean` | `true`         | 挂载后立即请求 |
| `lowerThreshold` | `number`  | `80`           | 提前触发距离   |
| `loadingText`    | `string`  | `'加载中'`     | 加载文案       |
| `finishedText`   | `string`  | `'没有更多了'` | 完成文案       |
| `errorText`      | `string`  | `undefined`    | 可重试错误文案 |

## Events

| Event   | Payload | 描述         |
| ------- | ------- | ------------ |
| `load`  | `void`  | 请求下一页   |
| `retry` | `void`  | 重试失败加载 |
