# Button

管理按钮的按压、禁用和加载状态，并处理原生激活行为。

## 运行时归属

`usePressableRoot` 状态机来自 `@varo-ui/headless`；本页 `ButtonRoot` 与 H5 交互示例来自 `@varo-ui/h5/primitives`。原生端使用 Wevu `VButton` SFC，没有对应的 Vue Parts。小程序标签页在浏览器中预览 `VButton` 的编译产物，可切换到代码查看原生源码；该预览不能替代微信真机验收。

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
