# Primitives

跨端无样式交互契约：`@varo-ui/headless` 管状态，目标端 primitives 管渲染。

## 安装

```bash
# H5
pnpm add @varo-ui/headless @varo-ui/h5

# 小程序
pnpm add @varo-ui/headless @varo-ui/weapp
```

::: info 小程序接入
全局样式与 Tailwind 配置见 [Wevu Registry](/guide/shadcn-mode)。
:::

## 运行时

| 包                          | 用途                 |
| --------------------------- | -------------------- |
| `@varo-ui/headless`         | 平台中立状态与事件   |
| `@varo-ui/h5/primitives`    | DOM、键盘与 ARIA     |
| `@varo-ui/weapp/primitives` | WXML、触摸与原生事件 |

## 目录

<PrimitiveCatalog locale="zh" />
