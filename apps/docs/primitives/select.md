# Select

可组合的选择器，管理选中值与打开状态。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="select" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## 分组、只读与禁用

使用 `SelectGroup/SelectLabel` 分组。设置 `readonly` 后仍可打开、关闭和浏览选项，但 `SelectItem` 和 `setValue` 不能修改 value；`disabled` 还会阻止打开。定位与动画由 UI 封装组件处理。

## Parts

| Part            | 作用            |
| --------------- | --------------- |
| `SelectRoot`    | value/open 状态 |
| `SelectTrigger` | 打开选择器      |
| `SelectValue`   | 当前值展示      |
| `SelectContent` | 选项容器        |
| `SelectGroup`   | 分组            |
| `SelectLabel`   | 分组标题        |
| `SelectItem`    | 单个选项        |

## Props

### SelectRoot

| Prop           | 类型                   | 默认值      | 描述                           |
| -------------- | ---------------------- | ----------- | ------------------------------ |
| `value`        | `unknown`              | `undefined` | 受控值                         |
| `defaultValue` | `unknown`              | `undefined` | 非受控初始值                   |
| `open`         | `boolean \| undefined` | `undefined` | 受控打开态                     |
| `defaultOpen`  | `boolean`              | `false`     | 非受控初始打开态               |
| `options`      | `array`                | `undefined` | 选项数据                       |
| `placeholder`  | `string`               | `undefined` | 占位文本                       |
| `disabled`     | `boolean`              | `false`     | 禁止打开和修改选中值           |
| `readonly`     | `boolean`              | `false`     | 允许浏览选项，但不能修改选中值 |
| `multiple`     | `boolean`              | `false`     | 允许多选                       |

### SelectItem

| Prop     | 类型     | 描述     |
| -------- | -------- | -------- |
| `option` | `object` | 选项对象 |

## Events

| Event          | Payload   | 描述               |
| -------------- | --------- | ------------------ |
| `update:value` | `unknown` | 同步选中值         |
| `valueChange`  | `unknown` | 选中值变化时触发   |
| `update:open`  | `boolean` | 同步打开状态       |
| `openChange`   | `boolean` | 打开状态变化时触发 |

## 无障碍

- Trigger 打开、Item 选择，均遵循上述只读与禁用规则。
- 具有选择角色的元素提供 `aria-readonly`，只读状态不标记为禁用。

::: info 平台差异

- H5 可实时预览打开/选择。
- 小程序侧浮层定位与 portal 策略由封装层处理。
  :::
