# Radio Group

由 Group、Item 和 Indicator 组合的单选组。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="radio-group" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## 禁用选项

在 `RadioItem` 上设置 `disabled` 可禁用该选项，不影响组级 value 的使用方式。

## Parts

| Part             | 作用                       |
| ---------------- | -------------------------- |
| `RadioGroup`     | 管理组级选中值并提供上下文 |
| `RadioItem`      | 单个选项                   |
| `RadioIndicator` | 选中指示器                 |

## Props

### RadioGroup

| Prop           | 类型                            | 默认值      | 描述         |
| -------------- | ------------------------------- | ----------- | ------------ |
| `value`        | `string \| number \| undefined` | `undefined` | 受控选中值   |
| `defaultValue` | `string \| number`              | `undefined` | 非受控初始值 |
| `disabled`     | `boolean`                       | `false`     | 整组禁用     |
| `as`           | `string`                        | `'div'`     | 根节点标签   |

### RadioItem

| Prop       | 类型               | 默认值     | 描述         |
| ---------- | ------------------ | ---------- | ------------ |
| `value`    | `string \| number` | 必填       | 选项值       |
| `disabled` | `boolean`          | `false`    | 选项禁用     |
| `as`       | `string`           | `'button'` | 选项节点标签 |

## Events

| Event          | Payload            | 描述             |
| -------------- | ------------------ | ---------------- |
| `update:value` | `string \| number` | 同步受控选中值   |
| `valueChange`  | `string \| number` | 选中值变化时触发 |

## 无障碍

- 组级 value 决定选中项，Indicator 只显示该状态。
- 禁用的 Item 不能被选中。

::: info 平台差异

- H5 与小程序共用 value/disabled 状态规则。
- 小程序的键盘焦点由页面管理。
  :::
