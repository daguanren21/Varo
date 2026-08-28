# Collapsible

单个展开区域运行时：Root 持有 open，Trigger 切换，Content 按状态显隐。

## 运行时

状态契约由 `@varo-ui/headless` 提供；渲染 Parts 分别来自 `@varo-ui/h5/primitives` 与 `@varo-ui/weapp/primitives`。

## 演示

<PrimitiveExample name="collapsible" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

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

## 平台说明

- 双端共享 open 契约。
- 动画与过渡不进入 primitive。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
