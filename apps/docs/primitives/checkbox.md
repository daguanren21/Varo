# Checkbox

可组合的复选框运行时：Root 持有 checked，Indicator 只负责选中时的渲染。

## 运行时

同时提供 `@varo/primitives-h5` 与 `@varo/primitives-weapp`。

## 演示

<PrimitiveExample name="checkbox" locale="zh" />

## 安装

```bash
pnpm add @varo/primitives-h5
# 或
pnpm add @varo/primitives-weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

## 禁用态

传入 `disabled` 后不再触发 `checkedChange`。Indicator 仍可根据当前 checked 渲染，但交互关闭。

## Parts

| Part | 作用 |
| --- | --- |
| `CheckboxRoot` | 状态与点击切换 |
| `CheckboxIndicator` | 选中时渲染的指示器 |

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `checked` | `boolean \| undefined` | `undefined` | 受控选中态 |
| `defaultChecked` | `boolean` | `false` | 非受控初始选中态 |
| `disabled` | `boolean` | `false` | 禁用交互 |
| `as` | `string` | `'button'` | 根节点标签 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:checked` | `boolean` | 受控同步选中态 |
| `checkedChange` | `boolean` | 选中态变化 |

## 无障碍

- Root 默认以 button 语义承载切换。
- Indicator 不单独承接点击。
- disabled 时不应触发 checked 变化。

## 平台说明

- H5 可在文档中实时预览。
- 小程序保持相同 `v-model:checked` 与 part 组合；焦点细节由页面容器处理。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
