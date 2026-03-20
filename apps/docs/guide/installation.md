# 安装指南

## 推荐接入路径

- 业务应用优先使用 `@varo/ui-h5` 或 `@varo/ui-weapp`
- 设计系统与企业二次封装优先使用 `@varo/primitives-h5` 或 `@varo/primitives-weapp`

## 官方 UI 封装

```bash
pnpm add vue @varo/ui-h5 @varo/theme
pnpm add vue wevu@6.10.2 @varo/ui-weapp @varo/theme
```

## Primitives Only

```bash
pnpm add vue @varo/primitives-h5
pnpm add vue wevu@6.10.2 @varo/primitives-weapp
```

## 工程化建议

- 文档站、playground 与组件包统一放在 monorepo 内维护
- 对外消费优先走正式包入口，workspace 开发阶段再切到源码入口
- 小程序相关能力当前与 `wevu@6.10.2` 对齐

## 版本说明

- `wevu` 当前固定在 `6.10.2`
- 文档站基于 `VitePress`
- Vue 侧使用 Vue 3 + TypeScript + `<script setup>`