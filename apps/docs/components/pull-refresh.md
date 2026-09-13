# PullRefresh 下拉刷新

`VPullRefresh` 负责顶部下拉刷新；列表底部的上拉/触底加载继续使用 [List](/components/list)。

## 演示

<PullRefreshDemo locale="zh" />

## Props

| Prop          | 类型      | 默认值       | 描述                 |
| ------------- | --------- | ------------ | -------------------- |
| `loading`     | `boolean` | `false`      | 受控刷新状态         |
| `disabled`    | `boolean` | `false`      | 禁止下拉刷新         |
| `threshold`   | `number`  | `64`         | 触发刷新距离         |
| `headHeight`  | `number`  | `48`         | H5-only 提示区域高度 |
| `pullText`    | `string`  | `'下拉刷新'` | H5-only 下拉提示     |
| `releaseText` | `string`  | `'释放刷新'` | H5-only 阈值提示     |
| `loadingText` | `string`  | `'加载中'`   | 刷新中提示           |

## Events

| Event     | Payload | 描述                     |
| --------- | ------- | ------------------------ |
| `refresh` | `void`  | 超过阈值释放或原生刷新时 |

::: info 平台行为

- H5：仅在滚动容器顶部响应向下拖动。
- 小程序：使用 `scroll-view` 原生 `refresher-*` 能力，由 `loading` 控制结束时机。
  :::
