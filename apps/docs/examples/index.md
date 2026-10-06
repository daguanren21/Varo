# 跨运行时案例

这里是 Varo 面向使用者的跨运行时展示页：先确认采用路径，再区分浏览器实时交互、浏览器中的 Weapp 契约预览，以及微信开发者工具中的已编译证据。仓库内的 playground 仍是维护者 QA surface，不是公开安装入口。

## 先选择采用路径

<div class="varo-adoption-grid">
  <article>
    <span>H5 REGISTRY</span>
    <h3>H5 业务项目</h3>
    <code>pnpm dlx @varo-ui/cli add --target h5 components/button</code>
    <p>将可编辑的 Vue 组件源码与依赖安装到业务仓库。</p>
  </article>
  <article>
    <span>WEAPP REGISTRY</span>
    <h3>Weapp 业务项目</h3>
    <code>pnpm dlx @varo-ui/cli add --target weapp components/button</code>
    <p>将 WXML-safe 的目标专用 Wevu SFC 与依赖安装到业务仓库。</p>
  </article>
  <article>
    <span>RUNTIME PACKAGE</span>
    <h3>集中式 H5 runtime</h3>
    <code>pnpm add @varo-ui/h5</code>
    <p>在明确需要统一升级时消费已发布组件包。</p>
  </article>
</div>

Registry 是默认采用路径；从[安装指南](/guide/installation)开始，再按目标生成源码。

## H5 Live 与 Weapp Contract Preview

下方组件可以直接操作。H5 标签运行 `@varo-ui/h5` 的真实浏览器组件；切换到小程序后，标签会明确变为 **Weapp Contract Preview**，用于检查公共 API 与视觉契约，不冒充小程序运行时。

<PlatformTabsDemo example="overview" locale="zh" />

## Weapp DevTools Verified：已编译 Blocks {#weapp-devtools-evidence}

小程序图库的 **13 个 Block** 于 **2026-10-05** 在 **375px 微信开发者工具模拟器**中重新采集，来自 `weapp-vite` 构建并实际运行的页面；展示图片裁去系统栏和模拟器边缘。可查看[采集脚本](https://github.com/daguanren21/Varo/blob/main/apps/playground-weapp/e2e/capture-blocks.mjs)和[示例截图](../blocks/login-form.png)；点击卡片下方链接可打开完整尺寸图片。

六个双端 Block 的 H5 浏览器截图更新于 **2026-10-05**；选择 H5 会同时切换图片、安装命令与使用代码。截图只覆盖采集时的版本，不同目标的截图不互相充当运行证据。

<MiniProgramBlocksGallery locale="zh" />

## 证据与实现边界

- `H5 Live`：当前页面中的真实浏览器组件与交互
- `Weapp Contract Preview`：浏览器渲染的目标契约，不是微信运行时
- `Weapp DevTools Verified`：已编译小程序页面的开发者工具证据，不等于物理设备或其他平台认证
- `weapp-vite` 负责组件 JSON、复杂列表 key、类型声明与目标产物；`wevu` 是 `@varo-ui/weapp` 的运行时 peer
- `weapp-tailwindcss` 在构建链中转译 class；原生 `hover-class` 表达小程序按压反馈

## 继续阅读

- [安装指南](/guide/installation)
- [构建你自己的 Block](/blocks/build-your-own)
- [Button 文档](/components/button)
- [主题配置](/guide/theme)
