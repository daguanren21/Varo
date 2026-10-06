# Accordion

手风琴运行时：Root 支持 single/multiple，Item 提供唯一 value，Trigger/Content 组成条目。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="accordion" locale="zh" />

## 基础用法

上方 H5 面板提供当前 Parts 的交互与代码；原生标签页仅展示源码/支持证据，不是小程序实时预览。

## multiple 模式

`type="multiple"` 时 value 为数组；Item value 必须唯一。

## Parts

| Part               | 作用     |
| ------------------ | -------- |
| `AccordionRoot`    | 集合状态 |
| `AccordionItem`    | 单个条目 |
| `AccordionTrigger` | 条目标题 |
| `AccordionContent` | 条目内容 |

## Props

### AccordionRoot

| Prop           | 类型                              | 默认值      | 描述                    |
| -------------- | --------------------------------- | ----------- | ----------------------- |
| `type`         | `'single' \| 'multiple'`          | 实现默认    | 单开/多开               |
| `value`        | `string \| string[] \| undefined` | `undefined` | 受控值                  |
| `defaultValue` | `string \| string[]`              | `undefined` | 非受控初始值            |
| `collapsible`  | `boolean`                         | `false`     | single 下是否可全部折叠 |
| `disabled`     | `boolean`                         | `false`     | 整组禁用                |
| `id`           | `string`                          | `undefined` | 关联 id                 |

### AccordionItem

| Prop       | 类型      | 描述       |
| ---------- | --------- | ---------- |
| `value`    | `string`  | 唯一条目值 |
| `disabled` | `boolean` | 条目禁用   |

## Events

| Event          | Payload              | 描述     |
| -------------- | -------------------- | -------- |
| `update:value` | `string \| string[]` | 受控同步 |
| `valueChange`  | `string \| string[]` | 值变化   |

## 无障碍

- Item value 关联 Trigger/Content。
- disabled item 不可展开。

::: info 平台差异

- 双端共享 single/multiple 契约。
- 动画与图标属于 UI wrapper。
  :::
