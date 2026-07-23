# Switch

开关运行时：Root 持有 checked，并支持 loading/disabled；Thumb 只消费上下文。

## 运行时

同时提供 `@varo/primitives-h5` 与 `@varo/primitives-weapp`。

## 演示

<PrimitiveExample name="switch" locale="zh" />

## 安装

```bash
pnpm add @varo/primitives-h5
# 或
pnpm add @varo/primitives-weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

## Loading

`loading` 与 `disabled` 都会关闭交互；loading 更适合异步提交中的短暂锁定。

## Parts

| Part | 作用 |
| --- | --- |
| `SwitchRoot` | 状态与切换 |
| `SwitchThumb` | 滑块 part |

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `checked` | `boolean \| undefined` | `undefined` | 受控开关态 |
| `defaultChecked` | `boolean` | `false` | 非受控初始态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中，不可切换 |
| `as` | `string` | `'button'` | 根节点标签 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:checked` | `boolean` | 受控同步 |
| `checkedChange` | `boolean` | 状态变化 |

## 无障碍

- Root 默认 button 语义。
- loading/disabled 时不可切换。

## 平台说明

- 双端共享 checked/loading 契约。
- 视觉轨道与动画由 UI wrapper 负责。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
