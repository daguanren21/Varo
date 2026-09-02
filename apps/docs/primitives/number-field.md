# Number Field

数值输入基座：Root 统一边界、步进与精度，增减按钮和输入框保持可组合。

## 运行时归属

`useNumberFieldRoot` 来自 `@varo-ui/headless`，H5 与小程序复用同一数值约束。

## 演示

<PrimitiveExample name="number-field" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- 数量、金额和评分调节都依赖可靠的 min/max/step。
- 拆分 Parts 后可以自由替换布局和图标。

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

## 平台说明

边界和精度跨端一致；原生输入事件由各目标适配。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
