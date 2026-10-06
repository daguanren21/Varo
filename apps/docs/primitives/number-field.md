# Number Field

数值输入基座：Root 统一边界、步进与精度，增减按钮和输入框保持可组合。

## 运行时归属

`useNumberFieldRoot` 来自 `@varo-ui/headless`，数值约束可跨端复用。本页 Parts 与交互示例仅属于 `@varo-ui/h5/primitives`；原生端使用 Wevu `VInputNumber` SFC，不提供等价 Vue Parts，原生标签页只展示源码/证据。

## 演示

<PrimitiveExample name="number-field" locale="zh" />

## Parts

| Part                   | 作用           |
| ---------------------- | -------------- |
| `NumberFieldRoot`      | 数值状态与约束 |
| `NumberFieldDecrement` | 减少动作       |
| `NumberFieldInput`     | 原生数值输入   |
| `NumberFieldIncrement` | 增加动作       |

## 状态与事件

- 状态：`value`、`min`、`max`、`step`、`precision`、`readonly`
- 事件：`update:value`、`valueChange`。

::: info 平台差异
边界和精度跨端一致；原生输入事件由各目标适配。
:::
