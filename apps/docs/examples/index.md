# 小程序业务 Blocks

这里不做展示墙，而是沉淀可直接复制的业务块：每个 block 都包含真实移动端需求、组件依赖、H5 写法和小程序写法。复制后可以先替换字段、接口和样式，再放入业务项目里继续封装。

<MiniProgramBlocksGallery locale="zh" />

## 小程序构建链路

- `weapp-vite@6.17.8` 负责小程序产物构建、组件 JSON 与类型声明输出
- `wevu@6.17.8` 作为小程序 Vue 运行时 peer，`@varo/ui-weapp` 与 `@varo/primitives-weapp` 保持同版本约束
- `weapp-tailwindcss@^5.1.8` 接入 `weapp-vite` 插件链，提供 class 转译能力；组件包仍以 Varo token 为主，业务项目可在上层启用 Tailwind utilities
- 如果要继续做企业内部设计系统，优先从 `@varo/primitives-*` 向上封装，再把 blocks 作为业务模板沉淀

## 相关文档

- [Button 文档](/components/button)
- [Input 文档](/components/input)
- [Dialog 文档](/components/dialog)
- [色彩系统](/guide/colors)
- [主题配置](/guide/theme)
