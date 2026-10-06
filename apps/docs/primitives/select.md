# Select

组合式选择器运行时：Root 持有 value/open，Trigger/Value/Content/Item 分工渲染。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="select" locale="zh" />

## 基础用法

上方 H5 面板提供当前 Parts 的交互与代码；原生标签页仅展示源码/支持证据，不是小程序实时预览。

## 分组、只读与禁用

分组用 `SelectGroup/SelectLabel`。`readonly` 状态下组件仍可打开、关闭和浏览选项，但 `SelectItem` 和 `setValue` 不会更改 value；`disabled` 连打开操作也会阻止。定位与动画交给 UI wrapper。

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

- Trigger 在普通与 readonly 状态下负责打开；disabled 时不能打开。
- Item 负责选择；readonly/disabled 时不应改 value。
- `aria-readonly` 由拥有选择语义的 role owner 暴露，不把 readonly 报告为 disabled。

::: info 平台差异

- H5 可实时预览打开/选择。
- 小程序侧浮层定位与 portal 策略由封装层处理。
  :::
