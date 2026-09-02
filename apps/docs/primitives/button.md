# Button

可按压入口基座：统一 pressed、disabled、loading 与原生激活语义。

## 运行时归属

`usePressableRoot` 状态机来自 `@varo-ui/headless`；渲染适配分别来自 H5 与小程序 primitives。

## 演示

<PrimitiveExample name="button" locale="zh" />

## 安装

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# 或
pnpm add @varo-ui/headless @varo-ui/weapp
```

## 为什么是基础能力

- 按钮、图标按钮和可点击卡片都需要一致的禁用与按压语义。
- UI wrapper 只需增加视觉 token，不再重写事件门禁。

## Parts

| Part         | 作用                                   |
| ------------ | -------------------------------------- |
| `ButtonRoot` | 原生激活、pressed、disabled 与 loading |

## 状态与事件

- 状态：`disabled`、`loading`、`size`、`variant`
- 事件：`click`；并输出 `data-pressed` / `data-loading`。

## 平台说明

H5 使用原生 button/键盘激活；小程序适配 tap 与原生按压反馈。

## 相关文档

- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
