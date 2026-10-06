# Popover

轻量浮层运行时：Root 持有 open，Trigger 打开，Content 展示，Close 显式关闭。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="popover" locale="zh" />

## 基础用法

上方 H5 面板提供当前 Parts 的交互与代码；原生标签页仅展示源码/支持证据，不是小程序实时预览。

## Dismiss 契约

H5 可处理 Escape/外部点击；原生端没有浏览器 `document`，使用原生 `VPopoverClose` SFC 或页面遮罩关闭，不直接复用本页的 H5 Parts。

## Parts

| Part             | 作用      |
| ---------------- | --------- |
| `PopoverRoot`    | open 状态 |
| `PopoverTrigger` | 打开入口  |
| `PopoverContent` | 浮层内容  |
| `PopoverClose`   | 显式关闭  |

## Props

| Prop          | 类型                   | 默认值      | 描述         |
| ------------- | ---------------------- | ----------- | ------------ |
| `open`        | `boolean \| undefined` | `undefined` | 受控打开态   |
| `defaultOpen` | `boolean`              | `false`     | 非受控初始态 |
| `disabled`    | `boolean`              | `false`     | 禁用         |

## Events

| Event         | Payload   | 描述       |
| ------------- | --------- | ---------- |
| `update:open` | `boolean` | 受控同步   |
| `openChange`  | `boolean` | 打开态变化 |

## 无障碍

- Trigger 打开浮层。
- Close 提供显式退出。
- disabled 时不打开。

::: info 平台差异

- H5 与小程序共享 open/close 契约。
- 定位、碰撞检测与 portal 留给 UI wrapper。
  :::
