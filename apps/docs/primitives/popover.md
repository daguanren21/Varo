# Popover

组合 Root、Trigger、Content 和 Close 创建浮层。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="popover" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## Dismiss 契约

H5 可处理 Escape 和外部点击。原生端没有浏览器 `document`，需使用原生 `VPopoverClose` SFC 或页面遮罩关闭。

## Parts

| Part             | 作用         |
| ---------------- | ------------ |
| `PopoverRoot`    | 管理打开状态 |
| `PopoverTrigger` | 打开浮层     |
| `PopoverContent` | 浮层内容     |
| `PopoverClose`   | 显式关闭     |

## Props

| Prop          | 类型                   | 默认值      | 描述               |
| ------------- | ---------------------- | ----------- | ------------------ |
| `open`        | `boolean \| undefined` | `undefined` | 受控打开态         |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始打开状态 |
| `disabled`    | `boolean`              | `false`     | 禁止打开浮层       |

## Events

| Event         | Payload   | 描述               |
| ------------- | --------- | ------------------ |
| `update:open` | `boolean` | 同步受控打开状态   |
| `openChange`  | `boolean` | 打开状态变化时触发 |

## 无障碍

- 禁用时，Trigger 不能打开浮层；Close 提供显式关闭操作。

::: info 平台差异

- H5 与小程序共享 open/close 契约。
- 定位、碰撞检测与 portal 由 UI 封装组件处理。
  :::
