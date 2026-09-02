# 小程序业务 Blocks

这里不做展示墙，而是沉淀可直接复制的业务块：每个 block 都包含真实移动端需求、组件依赖、H5 写法和小程序写法。复制后可以先替换字段、接口和样式，再放入业务项目里继续封装。

<MiniProgramBlocksGallery locale="zh" />

## 小程序构建链路

- `weapp-vite` 负责小程序产物构建、组件 JSON、复杂列表 key 与类型声明输出
- `wevu` 是 `@varo-ui/weapp` 的小程序运行时 peer；`@varo-ui/headless` 不绑定 Vue/Wevu
- `weapp-tailwindcss` 接入 `weapp-vite` 插件链，提供 class 转译能力；小程序按最新默认移除无效交互伪类，组件使用原生 `hover-class` 表达按压反馈
- 如果要继续做企业内部设计系统，优先从 `@varo-ui/headless` 向上封装，再把 blocks 作为业务模板沉淀

## 相关文档

- [Button 文档](/components/button)
- [Input 文档](/components/input)
- [Dialog 文档](/components/dialog)
- [色彩系统](/guide/colors)
- [主题配置](/guide/theme)
