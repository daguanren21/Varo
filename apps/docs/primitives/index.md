# Primitives

`@varo-ui/headless` 提供平台中立的无样式状态与事件契约。本文档的可组合 Parts 和交互示例仅属于 H5；原生端使用真正的 Wevu SFC 或 headless，不提供等价的 Vue Parts 渲染入口。

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

Headless 不导出 DOM 滚动锁定或浏览器焦点逻辑；H5 适配层负责这些副作用。所有 Parts 表格描述 H5 API。演示中的原生标签页只展示目标源码和支持证据，不是实时 Vue 小程序，也不证明设备能力；精确支持范围见 [安装 profile](/guide/installation#安装-profile-与支持边界)。

## 目录

<PrimitiveCatalog locale="zh" />
