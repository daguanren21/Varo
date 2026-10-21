# Accordion

支持 single/multiple 模式的可组合手风琴。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="accordion" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## multiple 模式

设置 `type="multiple"` 时，value 为数组；每个 Item 的 value 必须唯一。

## Parts

| Part               | 作用             |
| ------------------ | ---------------- |
| `AccordionRoot`    | 管理整组展开状态 |
| `AccordionItem`    | 单个条目         |
| `AccordionTrigger` | 条目标题         |
| `AccordionContent` | 条目内容         |

## Props

### AccordionRoot

| Prop           | 类型                              | 默认值      | 描述                              |
| -------------- | --------------------------------- | ----------- | --------------------------------- |
| `type`         | `'single' \| 'multiple'`          | 实现默认    | 一次展开一个或多个条目            |
| `value`        | `string \| string[] \| undefined` | `undefined` | 受控值                            |
| `defaultValue` | `string \| string[]`              | `undefined` | 非受控初始值                      |
| `collapsible`  | `boolean`                         | `false`     | single 模式下是否允许收起所有条目 |
| `disabled`     | `boolean`                         | `false`     | 整组禁用                          |
| `id`           | `string`                          | `undefined` | 关联 id                           |

### AccordionItem

| Prop       | 类型      | 描述       |
| ---------- | --------- | ---------- |
| `value`    | `string`  | 唯一条目值 |
| `disabled` | `boolean` | 条目禁用   |

## Events

| Event          | Payload              | 描述         |
| -------------- | -------------------- | ------------ |
| `update:value` | `string \| string[]` | 同步受控值   |
| `valueChange`  | `string \| string[]` | 值变化时触发 |

## 无障碍

- Item 的 value 用于关联 Trigger 和 Content。
- 禁用的 Item 不能展开。

::: info 平台差异

- 两端共用 single/multiple 状态规则。
- 动画与图标由 UI 封装组件提供。
  :::
