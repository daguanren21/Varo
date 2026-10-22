# Switch

Root 管理开关的选中、加载和禁用状态；Thumb 从上下文读取状态。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="switch" locale="zh" />

## 基础用法

H5 面板提供 Parts 交互与代码；原生标签页仅展示源码和支持证据，不提供实时小程序预览。

## Loading

`loading` 与 `disabled` 都会禁止交互。异步提交期间需要暂时禁用开关时，可使用 loading。

## Parts

| Part          | 作用               |
| ------------- | ------------------ |
| `SwitchRoot`  | 管理状态并处理切换 |
| `SwitchThumb` | 显示滑块           |

## Props

| Prop             | 类型                   | 默认值      | 描述               |
| ---------------- | ---------------------- | ----------- | ------------------ |
| `checked`        | `boolean \| undefined` | `undefined` | 受控开关态         |
| `defaultChecked` | `boolean`              | `false`     | 非受控初始开关状态 |
| `disabled`       | `boolean`              | `false`     | 禁止切换           |
| `loading`        | `boolean`              | `false`     | 加载中，禁止切换   |
| `as`             | `string`               | `'button'`  | 根节点标签         |

## Events

| Event            | Payload   | 描述               |
| ---------------- | --------- | ------------------ |
| `update:checked` | `boolean` | 同步受控开关状态   |
| `checkedChange`  | `boolean` | 开关状态变化时触发 |

## 无障碍

- Root 默认使用 button，加载或禁用时不可切换。

::: info 平台差异

- 双端共享 checked/loading 契约。
- 轨道样式与动画由 UI 封装组件提供。
  :::
