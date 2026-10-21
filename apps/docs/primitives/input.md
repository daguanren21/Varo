# Input

处理文本输入的受控值、格式化、只读、无效状态和长度，以及 textarea 高度自适应。

## 运行时归属

`useFieldRoot` 来自 `@varo-ui/headless`。本页 `InputRoot` 与交互示例仅适用于 `@varo-ui/h5/primitives`。原生端使用 Wevu `VInput` SFC；原生标签页仅展示源码和支持证据。输入法、DOM/WXML 和高度自适应由各自的运行时处理。

## 演示

<PrimitiveExample name="input" locale="zh" />

## Parts

| Part        | 作用                           |
| ----------- | ------------------------------ |
| `InputRoot` | 输入值、状态、格式化与原生事件 |

## 状态与事件

- 状态：`value`、`defaultValue`、`disabled`、`readonly`、`invalid`
- 事件：`update:value`、`valueChange`、`focus`、`blur`。
- 设置 `disabled` / `readonly` 时不能修改值。每次实际值变化被接受后，`update:value` / `valueChange` 各触发一次；值不变或清空操作未改变值时，不触发变化事件。

::: info 平台差异
H5 支持 textarea autosize；小程序保留同名状态和事件，使用原生输入组件。
:::
