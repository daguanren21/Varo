# Searchbar 搜索栏

## 演示

<FormComponentDemo example="searchbar" locale="zh" />

## Props

| Prop             | 类型      | 默认值      | 描述                   |
| ---------------- | --------- | ----------- | ---------------------- |
| `value`          | `string`  | `''`        | 当前值                 |
| `placeholder`    | `string`  | `'Search'`  | 占位文本               |
| `inputAriaLabel` | `string`  | `undefined` | 搜索输入框的无障碍名称 |
| `actionText`     | `string`  | `''`        | 右侧操作文本           |
| `clearable`      | `boolean` | `true`      | 可清空                 |
| `disabled`       | `boolean` | `false`     | 禁用                   |

## Events

下表 DOM 事件类型仅适用于 H5；原生事件的 payload 由对应 SFC 与宿主定义，不是浏览器 `MouseEvent`。

| Event    | Payload      | 描述         |
| -------- | ------------ | ------------ |
| `search` | `string`     | 提交搜索     |
| `cancel` | `void`       | 点击右侧操作 |
| `clear`  | `MouseEvent` | 清空         |
