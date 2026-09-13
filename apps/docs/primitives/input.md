# Input

文本输入基座：覆盖受控值、格式化、只读、无效态、长度与 textarea autosize。

## 运行时归属

`useFieldRoot` 来自 `@varo-ui/headless`；输入法、DOM/WXML 与 autosize 由目标适配。

## 演示

<PrimitiveExample name="input" locale="zh" />

## Parts

| Part        | 作用                           |
| ----------- | ------------------------------ |
| `InputRoot` | 输入值、状态、格式化与原生事件 |

## 状态与事件

- 状态：`value`、`defaultValue`、`disabled`、`readonly`、`invalid`
- 事件：`update:value`、`valueChange`、`focus`、`blur`。

::: info 平台差异
H5 支持 textarea autosize；小程序保留同名状态和事件，使用原生输入组件。
:::
