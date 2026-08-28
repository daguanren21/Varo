# Select

组合式选择器运行时：Root 持有 value/open，Trigger/Value/Content/Item 分工渲染。

## 运行时

状态契约由 `@varo-ui/headless` 提供；渲染 Parts 分别来自 `@varo-ui/h5/primitives` 与 `@varo-ui/weapp/primitives`。

## 演示

<PrimitiveExample name="select" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

## 分组与只读

分组用 `SelectGroup/SelectLabel`；`readonly` 阻止变更但仍可展示当前值。定位与动画交给 UI wrapper。

## Parts

| Part            | 作用            |
| --------------- | --------------- |
| `SelectRoot`    | value/open 状态 |
| `SelectTrigger` | 打开入口        |
| `SelectValue`   | 当前值展示      |
| `SelectContent` | 选项容器        |
| `SelectGroup`   | 分组            |
| `SelectLabel`   | 分组标题        |
| `SelectItem`    | 单个选项        |

## Props

### SelectRoot

| Prop           | 类型                   | 默认值      | 描述             |
| -------------- | ---------------------- | ----------- | ---------------- |
| `value`        | `unknown`              | `undefined` | 受控值           |
| `defaultValue` | `unknown`              | `undefined` | 非受控初始值     |
| `open`         | `boolean \| undefined` | `undefined` | 受控打开态       |
| `defaultOpen`  | `boolean`              | `false`     | 非受控初始打开态 |
| `options`      | `array`                | `undefined` | 选项数据         |
| `placeholder`  | `string`               | `undefined` | 占位             |
| `disabled`     | `boolean`              | `false`     | 禁用             |
| `readonly`     | `boolean`              | `false`     | 只读             |
| `multiple`     | `boolean`              | `false`     | 多选语义         |

### SelectItem

| Prop     | 类型     | 描述     |
| -------- | -------- | -------- |
| `option` | `object` | 选项对象 |

## Events

| Event          | Payload   | 描述       |
| -------------- | --------- | ---------- |
| `update:value` | `unknown` | 值同步     |
| `valueChange`  | `unknown` | 值变化     |
| `update:open`  | `boolean` | 打开态同步 |
| `openChange`   | `boolean` | 打开态变化 |

## 无障碍

- Trigger 负责打开。
- Item 负责选择。
- disabled/readonly 时不应改 value。

## 平台说明

- H5 可实时预览打开/选择。
- 小程序侧浮层定位与 portal 策略由封装层处理。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
