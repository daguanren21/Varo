# Tabs

通过共享 value 关联选项卡标题与内容面板。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="tabs" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## 受控与唯一 value

同一 `TabsRoot` 内，每组 Trigger/Content 使用唯一的 value。H5 自动模式支持方向键切换。

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
| `orientation`  | `string`                        | `undefined` | 选项卡方向   |
| `disabled`     | `boolean`                       | `false`     | 整组禁用     |
| `id`           | `string`                        | `undefined` | 关联 id 前缀 |
| `as`           | `string`                        | `'div'`     | 根节点标签   |

### TabsTrigger / TabsContent

| Prop       | 类型               | 描述                 |
| ---------- | ------------------ | -------------------- |
| `value`    | `string \| number` | 与 Root 关联的唯一值 |
| `disabled` | `boolean`          | 仅 Trigger 支持禁用  |

## Events

| Event          | Payload            | 描述             |
| -------------- | ------------------ | ---------------- |
| `update:value` | `string \| number` | 同步受控激活项   |
| `valueChange`  | `string \| number` | 激活项变化时触发 |

## 无障碍

- value 同时决定激活状态和面板关联。
- H5 支持方向键、Home 和 End。
- 小程序保留 ARIA 与 value 关联，不模拟浏览器焦点。

::: info 平台差异

- H5 面板可演示上述键盘操作；原生标签页仅展示源码与证据，不运行 Parts 渲染器。
  :::
