# Radio Group

单选组运行时：Group 持有 value，Item 表达选项，Indicator 渲染选中标记。

## 运行时

同时提供 `@varo/primitives-h5` 与 `@varo/primitives-weapp`。

## 演示

<PrimitiveExample name="radio-group" locale="zh" />

## 安装

```bash
pnpm add @varo/primitives-h5
# 或
pnpm add @varo/primitives-weapp
```

## 基础用法

通过上方演示面板切换 H5 实时预览，以及小程序运行时契约/代码。

## 禁用选项

在 `RadioItem` 上设置 `disabled`，可保留组级 value 契约的同时屏蔽单个选项。

## Parts

| Part | 作用 |
| --- | --- |
| `RadioGroup` | 组级 value 与上下文 |
| `RadioItem` | 单个选项 |
| `RadioIndicator` | 选中指示器 |

## Props

### RadioGroup

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `string \| number \| undefined` | `undefined` | 受控选中值 |
| `defaultValue` | `string \| number` | `undefined` | 非受控初始值 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `as` | `string` | `'div'` | 根节点标签 |

### RadioItem

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `string \| number` | 必填 | 选项值 |
| `disabled` | `boolean` | `false` | 选项禁用 |
| `as` | `string` | `'button'` | 选项节点标签 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string \| number` | 受控同步选中值 |
| `valueChange` | `string \| number` | 选中值变化 |

## 无障碍

- 组级 value 决定当前选中项。
- 禁用 Item 不可被选中。
- Indicator 只反映状态。

## 平台说明

- H5 与小程序共用 value/disabled 契约。
- 小程序侧键盘焦点由页面管理。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
- [Blocks](/blocks/profile-edit)
