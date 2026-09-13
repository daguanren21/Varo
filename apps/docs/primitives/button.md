# Button

可按压入口基座：统一 pressed、disabled、loading 与原生激活语义。

## 运行时归属

`usePressableRoot` 状态机来自 `@varo-ui/headless`；渲染适配分别来自 H5 与小程序 primitives。

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
