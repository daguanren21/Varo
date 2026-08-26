# Searchbar 搜索栏

## 演示

<FormComponentDemo example="searchbar" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `string` | `''` | 当前值 |
| `placeholder` | `string` | `'Search'` | 占位文本 |
| `actionText` | `string` | `''` | 右侧操作文本 |
| `clearable` | `boolean` | `true` | 可清空 |
| `disabled` | `boolean` | `false` | 禁用 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `search` | `string` | 提交搜索 |
| `cancel` | `void` | 点击右侧操作 |
| `clear` | `MouseEvent` | 清空 |
