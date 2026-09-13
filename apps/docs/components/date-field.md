# DateField 日期字段

年 / 月 / 日三列选择，底层复用 `VPicker`。月历网格继续用 [Calendar](/components/calendar)，不要把 DateField 当成日历。

## 演示

<DateFieldDemo locale="zh" />

## Props

| Prop          | 类型      | 默认值          | 描述                  |
| ------------- | --------- | --------------- | --------------------- |
| `visible`     | `boolean` | `false`         | Picker 是否展示       |
| `value`       | `string`  | `undefined`     | 当前日期 `YYYY-MM-DD` |
| `placeholder` | `string`  | `'Select date'` | 空值文案              |
| `disabled`    | `boolean` | `false`         | 禁用字段              |
| `readonly`    | `boolean` | `false`         | 只读字段              |
| `minYear`     | `number`  | `1970`          | 起始年份              |
| `maxYear`     | `number`  | `2100`          | 结束年份              |
| `title`       | `string`  | `undefined`     | Picker 标题           |
| `confirmText` | `string`  | `'Confirm'`     | 确认文案              |
| `cancelText`  | `string`  | `'Cancel'`      | 取消文案              |

## Events

| Event            | Payload   | 描述           |
| ---------------- | --------- | -------------- |
| `update:value`   | `string`  | 确认后提交日期 |
| `update:visible` | `boolean` | Picker 显隐    |
| `change`         | `string`  | 草稿日期变化   |
| `confirm`        | `string`  | 确认并提交     |
| `cancel`         | `void`    | 取消并保留原值 |
