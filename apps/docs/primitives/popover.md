# Popover

轻量浮层运行时：Root 持有 open，Trigger 打开，Content 展示，Close 显式关闭。

## 运行时

状态契约由 `@varo-ui/headless` 提供；渲染 Parts 分别来自 `@varo-ui/h5/primitives` 与 `@varo-ui/weapp/primitives`。

## 演示

<PrimitiveExample name="popover" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

## Dismiss 契约

H5 可处理 Escape/外部点击；小程序没有浏览器 `document`，应优先 `PopoverClose`、页面遮罩或页面级 dismiss adapter。

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

## 平台说明

- H5 与小程序共享 open/close 契约。
- 定位、碰撞检测与 portal 留给 UI wrapper。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
