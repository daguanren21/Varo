# Checkbox

由 Root 和 Indicator 组合的复选框。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="checkbox" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## 禁用态

`disabled` 禁止交互，也不再触发 `checkedChange`；Indicator 仍可显示当前选中状态。

## Parts

| Part                | 作用                       |
| ------------------- | -------------------------- |
| `CheckboxRoot`      | 管理选中状态，处理点击切换 |
| `CheckboxIndicator` | 选中时渲染的指示器         |

## Props

| Prop             | 类型                   | 默认值      | 描述             |
| ---------------- | ---------------------- | ----------- | ---------------- |
| `checked`        | `boolean \| undefined` | `undefined` | 受控选中态       |
| `defaultChecked` | `boolean`              | `false`     | 非受控初始选中态 |
| `disabled`       | `boolean`              | `false`     | 禁用交互         |
| `as`             | `string`               | `'button'`  | 根节点标签       |

## Events

| Event            | Payload   | 描述               |
| ---------------- | --------- | ------------------ |
| `update:checked` | `boolean` | 同步受控选中状态   |
| `checkedChange`  | `boolean` | 选中状态变化时触发 |

## 无障碍

- Root 默认使用 button 处理切换；Indicator 不单独处理点击。

::: info 平台差异

- 本页的 `v-model:checked` 与 Parts 组合用于 H5。原生端使用 Registry 中的 Wevu SFC，焦点由页面容器处理。
  :::
