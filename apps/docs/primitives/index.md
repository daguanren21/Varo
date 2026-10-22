# Primitives

`@varo-ui/headless` 提供不依赖平台的状态与事件逻辑，不包含样式。本文档中的可组合 Parts 和交互示例仅适用于 H5。原生端使用 Wevu SFC 或 headless，没有对应的 Vue Parts 渲染入口。

## 安装

```bash
# H5
pnpm add @varo-ui/headless @varo-ui/h5

# 原生 SFC（需要匹配的 weapp-vite 编译链）
pnpm add wevu @varo-ui/headless @varo-ui/weapp
```

::: info 小程序接入
全局样式与 Tailwind 配置见 [Wevu Registry](/guide/shadcn-mode)。
:::

## 运行时

| 包                                               | 用途                                         |
| ------------------------------------------------ | -------------------------------------------- |
| `@varo-ui/headless`                              | 平台中立状态与事件                           |
| `@varo-ui/h5/primitives`                         | DOM、键盘与 ARIA                             |
| `@varo-ui/weapp` / `@varo-ui/weapp/components/*` | 原生 Wevu SFC 源码，由目标编译器生成原生产物 |

DOM 滚动锁定和浏览器焦点逻辑由 H5 适配层负责，Headless 不导出这些功能。所有 Parts 表格均描述 H5 API。原生标签页展示目标源码和支持证据；其中的浏览器预览不等同于实时 Vue 小程序，也不证明设备支持。精确支持范围见 [安装 profile](/guide/installation#安装-profile-与支持边界)。

## 目录

<PrimitiveCatalog locale="zh" />
