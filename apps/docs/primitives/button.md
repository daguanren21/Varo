# Button

可按压入口基座：统一 pressed、disabled、loading 与原生激活语义。

## 运行时归属

`usePressableRoot` 状态机来自 `@varo-ui/headless`；本页 `ButtonRoot` 与交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu `VButton` SFC，不提供等价 Vue Parts；原生标签页仅展示源码/证据。

## 演示

<PrimitiveExample name="button" locale="zh" />

## Parts

| Part         | 作用                                   |
| ------------ | -------------------------------------- |
| `ButtonRoot` | 原生激活、pressed、disabled 与 loading |

## 状态与事件

- 状态：`disabled`、`loading`、`size`、`variant`
- 事件：`click`；并输出 `data-pressed` / `data-loading`。

::: info 平台差异
H5 使用原生 button/键盘激活；小程序适配 tap 与原生按压反馈。
:::
