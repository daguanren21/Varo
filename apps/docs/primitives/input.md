# Input

文本输入基座：覆盖受控值、格式化、只读、无效态、长度与 textarea autosize。

## 运行时归属

`useFieldRoot` 来自 `@varo-ui/headless`。本页 `InputRoot` 与交互示例仅属于 `@varo-ui/h5/primitives`；原生端使用 Wevu `VInput` SFC，原生标签页只展示源码/证据。输入法、DOM/WXML 与 autosize 由目标处理。

## 演示

<PrimitiveExample name="input" locale="zh" />

## Parts

| Part        | 作用                           |
| ----------- | ------------------------------ |
| `InputRoot` | 输入值、状态、格式化与原生事件 |

## 状态与事件

- 状态：`value`、`defaultValue`、`disabled`、`readonly`、`invalid`
- 事件：`update:value`、`valueChange`、`focus`、`blur`。
- `disabled` / `readonly` 拒绝值修改；接受一次实际变化才各触发一次 `update:value` / `valueChange`，相同值与无效清空不触发变化事件。

::: info 平台差异
H5 支持 textarea autosize；小程序保留同名状态和事件，使用原生输入组件。
:::
