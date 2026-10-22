# Number Field

Root 管理数值边界、步长和精度，增减按钮与输入框可组合使用。

## 运行时归属

`useNumberFieldRoot` 来自 `@varo-ui/headless`，数值约束可跨端复用。本页 Parts 与交互示例仅适用于 `@varo-ui/h5/primitives`。原生端使用 Wevu `VInputNumber` SFC，没有对应的 Vue Parts；原生标签页仅展示源码和支持证据。

## 演示

<PrimitiveExample name="number-field" locale="zh" />

## Parts

| Part                   | 作用           |
| ---------------------- | -------------- |
| `NumberFieldRoot`      | 数值状态与约束 |
| `NumberFieldDecrement` | 减小数值       |
| `NumberFieldInput`     | 原生数值输入   |
| `NumberFieldIncrement` | 增大数值       |

## 状态与事件

- 状态：`value`、`min`、`max`、`step`、`precision`、`readonly`
- 事件：`update:value`、`valueChange`。

::: info 平台差异
边界和精度跨端一致；原生输入事件由各目标适配。
:::
