# Collapsible

组合 Root、Trigger 和 Content，控制单个区域的展开与收起。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="collapsible" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## 受控展开

需要与路由或埋点同步展开状态时，使用 `v-model:open`。高度动画由 UI 封装组件处理。

## Parts

| Part                 | 作用           |
| -------------------- | -------------- |
| `CollapsibleRoot`    | 管理展开状态   |
| `CollapsibleTrigger` | 切换展开与收起 |
| `CollapsibleContent` | 可展开内容     |

## Props

| Prop          | 类型                   | 默认值      | 描述               |
| ------------- | ---------------------- | ----------- | ------------------ |
| `open`        | `boolean \| undefined` | `undefined` | 受控展开态         |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始展开状态 |
| `disabled`    | `boolean`              | `false`     | 禁止切换展开状态   |
| `as`          | `string`               | `'div'`     | 根节点标签         |

## Events

| Event         | Payload   | 描述               |
| ------------- | --------- | ------------------ |
| `update:open` | `boolean` | 同步受控展开状态   |
| `openChange`  | `boolean` | 展开状态变化时触发 |

## 无障碍

- Trigger 切换展开状态；禁用时不能切换。

::: info 平台差异

- 两端共用展开状态规则。
- 动画与过渡由 primitive 之外的组件处理。
  :::
