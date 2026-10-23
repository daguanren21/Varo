# TimeField 时间字段

`VTimeField` 复用 [Picker](/components/picker) 选择小时和分钟。值使用严格的 24 小时制 `HH:mm`，不包含秒、时区或 12 小时制转换。

## 演示

<ComponentPlatformDemo component="time-field" locale="zh">
  <TimeFieldDemo locale="zh" />
</ComponentPlatformDemo>

## 基本用法

```vue
<script setup lang="ts">
import { VTimeField } from '@varo-ui/h5'
import { ref } from 'vue'

const time = ref('09:30')
const visible = ref(false)
</script>

<template>
  <VTimeField
    v-model:value="time"
    v-model:visible="visible"
    title="预约时间"
    min="09:00"
    max="18:00"
    :minute-step="15"
    clearable
    confirm-text="确认"
    cancel-text="取消"
    clear-text="清空"
    placeholder="请选择时间"
  />
</template>
```

原生端从安装后的 `src/components/ui/v-time-field.vue` 导入组件，响应式 API 从 `wevu` 导入。`components/time-field` 的 Registry manifest 声明 Picker、基础主题、原生 `cn` 以及纯时间辅助文件的完整依赖；无需导入 DateField 或 Calendar。原生样式通过应用全局样式入口加载，不能在组件内重复导入全局 CSS。

## 候选、约束与受控状态

`value` 和 `visible` 都由父级控制。点击字段只发送 `update:visible(true)`；选择小时/分钟只更新草稿，确认才发送值更新。父级拒绝或延迟接受更新时，字段继续显示原始 `value`。取消、外部关闭、重新打开或父级替换 `value` 都会放弃旧草稿。

边界包含端点。`min="22:30" max="02:15"` 表示跨午夜的可选区间 `22:30–23:59` 与 `00:00–02:15`；`min` 等于 `max` 时只允许该分钟。`minuteStep` 必须是 `1..59` 的整数，默认 `1`，每个小时从 `00` 重新计步。例如 `15` 对应 `00/15/30/45`，`7` 对应 `00/07/14/21/28/35/42/49/56`。不合法的步长或边界配置会抛出 `RangeError`。

外部传入的无效、越界或不符合步长的值仍按原文显示，挂载和打开时不会发送修正值。选择器为草稿选择合法候选：优先保留合法完整值，否则使用原小时内的首个可用分钟，再尝试一天中首个可用时间。这个候选只有经过用户确认才会提交。切换小时后，分钟选项会随边界重新计算；确认会再次校验完整时间。

例如 `min="10:01" max="10:14" :minute-step="15"` 没有可用候选，确认按钮不可用。`disabled` 或 `readonly` 时不能展开、修改或清空；即使父级强制设置 `visible=true`，选项与确认仍不可用，取消仍可关闭。

## Props

| Prop          | 类型      | 默认值          | 描述                                           |
| ------------- | --------- | --------------- | ---------------------------------------------- |
| `value`       | `string`  | `undefined`     | 父级接受的 `HH:mm`；`''` 表示空值              |
| `visible`     | `boolean` | `false`         | 受控的选择器展示状态                           |
| `min`         | `string`  | `'00:00'`       | 最早可用时间，包含端点                         |
| `max`         | `string`  | `'23:59'`       | 最晚可用时间；小于 `min` 时跨午夜              |
| `minuteStep`  | `number`  | `1`             | 每小时从 `00` 开始的整数分钟步长，范围 `1..59` |
| `disabled`    | `boolean` | `false`         | 禁用字段及强制展开后的操作                     |
| `readonly`    | `boolean` | `false`         | 只读，禁止所有值修改                           |
| `clearable`   | `boolean` | `false`         | 有值时显示独立清空按钮                         |
| `placeholder` | `string`  | `'Select time'` | 空值文案                                       |
| `title`       | `string`  | `undefined`     | 选择器标题                                     |
| `confirmText` | `string`  | `'Confirm'`     | 确认文案                                       |
| `cancelText`  | `string`  | `'Cancel'`      | 取消文案                                       |
| `clearText`   | `string`  | `'Clear'`       | 清空文案                                       |

`min`/`max` 的默认值表示缺省时的有效边界。原生可选受控属性保留 `null` 缺省语义；显式 `false` 与 `''` 不会被当作未传入。

## Events

| Event            | Payload   | 描述                                                  |
| ---------------- | --------- | ----------------------------------------------------- |
| `update:value`   | `string`  | 合法且不同于当前值的确认，或清空为 `''`               |
| `update:visible` | `boolean` | 请求打开或关闭；由父级接受                            |
| `change`         | `string`  | 不同的合法草稿；清空非空值时为 `''`，不是确认提交通知 |
| `confirm`        | `string`  | 合法的确认意图，相同值再次确认也会触发                |
| `cancel`         | `void`    | 取消草稿并请求关闭                                    |
| `clear`          | `void`    | 请求清空非空值                                        |

重复点击当前候选不会发送 `change`。确认相同值只发送 `confirm` 与关闭请求，不重复发送 `update:value` 或 `change`。H5 和原生事件均为单个标量参数；从原生 `<picker mode="time">` 迁移时，使用 `@update:value="value => ..."` 接收字符串，不再读取 `event.detail.value`。
