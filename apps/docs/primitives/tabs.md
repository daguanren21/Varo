# Tabs

选项卡运行时：Root 持有当前 value，Trigger/Content 通过相同 value 关联。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="tabs" locale="zh" />

## 基础用法

上方 H5 面板提供当前 Parts 的交互与代码；原生标签页仅展示源码/支持证据，不是小程序实时预览。

## 受控与唯一 value

同一 `TabsRoot` 内 Trigger/Content 的 value 必须唯一；H5 自动模式下支持方向键切换。

## Parts

| Part          | 作用                      |
| ------------- | ------------------------- |
| `TabsRoot`    | 当前 value 与 orientation |
| `TabsList`    | trigger 容器              |
| `TabsTrigger` | 单个标题                  |
| `TabsContent` | 对应面板                  |

## Props

### TabsRoot

| Prop           | 类型                            | 默认值      | 描述         |
| -------------- | ------------------------------- | ----------- | ------------ |
| `value`        | `string \| number \| undefined` | `undefined` | 受控激活项   |
| `defaultValue` | `string \| number`              | `undefined` | 非受控初始项 |
| `orientation`  | `string`                        | `undefined` | 方向语义     |
| `disabled`     | `boolean`                       | `false`     | 整组禁用     |
| `id`           | `string`                        | `undefined` | 关联 id 前缀 |
| `as`           | `string`                        | `'div'`     | 根节点标签   |

### TabsTrigger / TabsContent

| Prop       | 类型               | 描述                 |
| ---------- | ------------------ | -------------------- |
| `value`    | `string \| number` | 与 Root 关联的唯一值 |
| `disabled` | `boolean`          | 仅 Trigger 支持禁用  |

## Events

| Event          | Payload            | 描述       |
| -------------- | ------------------ | ---------- |
| `update:value` | `string \| number` | 受控同步   |
| `valueChange`  | `string \| number` | 激活项变化 |

## 无障碍

- value 同时用于状态与 panel 关联。
- H5 支持方向键/Home/End。
- 小程序保留 ARIA 与 value 关联，不模拟浏览器焦点。

::: info 平台差异

- H5 可演示键盘行为。
- 原生标签页提供目标源码与证据，不运行另一套 Parts 渲染器。
  :::
