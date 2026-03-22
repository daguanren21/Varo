# 跨端演示

跨端示例现在统一放在一个页面里，通过 tabs 在 `H5` 和 `小程序` 之间切换。这样代码、运行包和演示效果都能在同一块区域里对照查看。

<PlatformTabsDemo example="overview" locale="zh" />

## 接入说明

- 当前小程序侧依赖固定为 `wevu@6.10.2`
- 官方开箱即用封装分别来自 `@varo/ui-h5` 与 `@varo/ui-weapp`
- 如果要继续做企业内部设计系统，优先从 `@varo/primitives-*` 向上封装

## 相关文档

- [Button 文档](/components/button)
- [Input 文档](/components/input)
- [Dialog 文档](/components/dialog)
- [主题配置](/guide/theme)
