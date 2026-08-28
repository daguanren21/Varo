# Tabs

选项卡运行时：Root 持有当前 value，Trigger/Content 通过相同 value 关联。

## 运行时

状态契约由 `@varo-ui/headless` 提供；渲染 Parts 分别来自 `@varo-ui/h5/primitives` 与 `@varo-ui/weapp/primitives`。

## 演示

<PrimitiveExample name="tabs" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

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

## 平台说明

- H5 可演示键盘行为。
- 小程序文档展示运行时契约，不伪装成真机预览。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
