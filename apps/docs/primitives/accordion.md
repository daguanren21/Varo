# Accordion

手风琴运行时：Root 支持 single/multiple，Item 提供唯一 value，Trigger/Content 组成条目。

## 运行时

同时提供 `@varo/primitives-h5` 与 `@varo/primitives-weapp`。

## 演示

<PrimitiveExample name="accordion" locale="zh" />

## 安装

```bash
pnpm add @varo/primitives-h5
# 或
pnpm add @varo/primitives-weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

## multiple 模式

`type="multiple"` 时 value 为数组；Item value 必须唯一。

## Parts

| Part | 作用 |
| --- | --- |
| `AccordionRoot` | 集合状态 |
| `AccordionItem` | 单个条目 |
| `AccordionTrigger` | 条目标题 |
| `AccordionContent` | 条目内容 |

## Props

### AccordionRoot

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | 实现默认 | 单开/多开 |
| `value` | `string \| string[] \| undefined` | `undefined` | 受控值 |
| `defaultValue` | `string \| string[]` | `undefined` | 非受控初始值 |
| `collapsible` | `boolean` | `false` | single 下是否可全部折叠 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `id` | `string` | `undefined` | 关联 id |

### AccordionItem

| Prop | 类型 | 描述 |
| --- | --- | --- |
| `value` | `string` | 唯一条目值 |
| `disabled` | `boolean` | 条目禁用 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string \| string[]` | 受控同步 |
| `valueChange` | `string \| string[]` | 值变化 |

## 无障碍

- Item value 关联 Trigger/Content。
- disabled item 不可展开。

## 平台说明

- 双端共享 single/multiple 契约。
- 动画与图标属于 UI wrapper。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
