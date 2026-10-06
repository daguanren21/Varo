# Collapsible

单个展开区域运行时：Root 持有 open，Trigger 切换，Content 按状态显隐。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="collapsible" locale="zh" />

## 基础用法

上方 H5 面板提供当前 Parts 的交互与代码；原生标签页仅展示源码/支持证据，不是小程序实时预览。

## 受控展开

需要和路由/埋点同步时使用 `v-model:open`；高度动画放在 UI wrapper。

## Parts

| Part                 | 作用       |
| -------------------- | ---------- |
| `CollapsibleRoot`    | open 状态  |
| `CollapsibleTrigger` | 切换入口   |
| `CollapsibleContent` | 可展开内容 |

## Props

| Prop          | 类型                   | 默认值      | 描述         |
| ------------- | ---------------------- | ----------- | ------------ |
| `open`        | `boolean \| undefined` | `undefined` | 受控展开态   |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始态 |
| `disabled`    | `boolean`              | `false`     | 禁用         |
| `as`          | `string`               | `'div'`     | 根节点标签   |

## Events

| Event         | Payload   | 描述       |
| ------------- | --------- | ---------- |
| `update:open` | `boolean` | 受控同步   |
| `openChange`  | `boolean` | 展开态变化 |

## 无障碍

- Trigger 控制 open。
- disabled 时不切换。

::: info 平台差异

- 双端共享 open 契约。
- 动画与过渡不进入 primitive。
  :::
