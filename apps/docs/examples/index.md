# 跨运行时案例

这里可操作 H5 组件、查看原生源码和运行截图。仓库内的 playground 用于维护者 QA，不是公开安装入口。

## 先选择采用路径

<div class="varo-adoption-grid">
  <article>
    <span>H5 REGISTRY</span>
    <h3>H5 业务项目</h3>
    <code>pnpm dlx @varo-ui/cli add --target h5 components/button</code>
    <p>将可编辑的 Vue 组件源码和递归 Registry 依赖复制到业务仓库；npm 依赖另外安装。</p>
  </article>
  <article>
    <span>WEAPP REGISTRY</span>
    <h3>Weapp 业务项目</h3>
    <code>pnpm dlx @varo-ui/cli add --target weapp components/button</code>
    <p>复制目标专用 Wevu SFC 和递归 Registry 依赖；另行安装报告的 npm 依赖并配置全局样式。</p>
  </article>
  <article>
    <span>RUNTIME PACKAGE</span>
    <h3>集中式 H5 runtime</h3>
    <code>pnpm add @varo-ui/h5</code>
    <p>需要统一升级组件时，使用已发布的 H5 组件包。</p>
  </article>
</div>

Registry 是默认采用路径；从[安装指南](/guide/installation)开始，再按目标生成源码。

## H5 Live 与原生源码证据

H5 标签运行可直接操作的 `@varo-ui/h5` 浏览器组件；原生标签只展示目标 Wevu SFC 源码与支持信息，不用 Vue 模拟小程序，也不运行原生运行时。

<PlatformTabsDemo example="overview" locale="zh" />

## Weapp DevTools Verified：已编译 Blocks {#weapp-devtools-evidence}

图库中的 **13 个 Block** 截图于 **2026-10-05** 在 **375px 微信开发者工具模拟器**中重新采集，来自 `weapp-vite` 构建并运行的页面，图片已裁去系统栏和模拟器边缘。可查看[采集脚本](https://github.com/daguanren21/Varo/blob/main/apps/playground-weapp/e2e/capture-blocks.mjs)和[示例截图](../blocks/login-form.png)，或通过卡片下方链接打开原尺寸图片。

六个双端 Block 的 H5 截图也于同日更新。选择 H5 会同时切换图片、安装命令与使用代码。

截图只记录采集时的版本，不能作为当前源码的回归结果、其他目标的运行证据，或六个实验性 profile 与真机的认证。当前准入和编译检查范围见[安装指南](/guide/installation#安装-profile-与支持边界)。

<MiniProgramBlocksGallery locale="zh" />

## 证据与实现边界

- `H5 Live`：当前页面中的真实浏览器组件与交互
- 原生源码：Registry manifest 与 Wevu SFC 的可检查证据，不是 live preview
- 编译产物浏览器预览：glass-easel 执行可信产物；同源 iframe 不是安全沙箱，也不证明设备能力
- `Weapp DevTools Verified`：注明日期的开发者工具页面截图，不代表所有组件或 profile 当前已验收
- `weapp-vite` 负责组件 JSON、复杂列表 key、类型声明与目标产物；`wevu` 是 `@varo-ui/weapp` 的运行时 peer
- `weapp-tailwindcss` 在构建链中转译 class；原生 `hover-class` 表达小程序按压反馈

## 继续阅读

- [安装指南](/guide/installation)
- [构建你自己的 Block](/blocks/build-your-own)
- [Button 文档](/components/button)
- [主题配置](/guide/theme)
