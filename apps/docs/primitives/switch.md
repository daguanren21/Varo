# Switch

开关运行时：Root 持有 checked，并支持 loading/disabled；Thumb 只消费上下文。

## 运行时

状态契约由 `@varo-ui/headless` 提供；本页 Parts 和交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu SFC 或 headless，不提供等价的 Vue Parts。

## 演示

<PrimitiveExample name="switch" locale="zh" />

## 基础用法

上方 H5 面板提供当前 Parts 的交互与代码；原生标签页仅展示源码/支持证据，不是小程序实时预览。

## Loading

`loading` 与 `disabled` 都会关闭交互；loading 更适合异步提交中的短暂锁定。

## Parts

| Part          | 作用       |
| ------------- | ---------- |
| `SwitchRoot`  | 状态与切换 |
| `SwitchThumb` | 滑块 part  |

## Props

| Prop             | 类型                   | 默认值      | 描述             |
| ---------------- | ---------------------- | ----------- | ---------------- |
| `checked`        | `boolean \| undefined` | `undefined` | 受控开关态       |
| `defaultChecked` | `boolean`              | `false`     | 非受控初始态     |
| `disabled`       | `boolean`              | `false`     | 禁用             |
| `loading`        | `boolean`              | `false`     | 加载中，不可切换 |
| `as`             | `string`               | `'button'`  | 根节点标签       |

## Events

| Event            | Payload   | 描述     |
| ---------------- | --------- | -------- |
| `update:checked` | `boolean` | 受控同步 |
| `checkedChange`  | `boolean` | 状态变化 |

## 无障碍

- Root 默认 button 语义。
- loading/disabled 时不可切换。

::: info 平台差异

- 双端共享 checked/loading 契约。
- 视觉轨道与动画由 UI wrapper 负责。
  :::
