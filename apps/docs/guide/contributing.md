# 如何贡献

## 推荐落地顺序

1. 在 `packages/primitives-core` 定义平台中立状态与事件；响应式接口统一由 `packages/shared` 持有，不能依赖 Vue、Wevu 或 DOM
2. 在 `registry/components/**/*` 编写 H5 renderer 与真正的原生 Wevu SFC；DOM、焦点、键盘与滚动锁定只属于 H5 适配层
3. 在 `registry/themes/**/*` 维护主题作者源；`themes/base` 只含 tokens 与基础规则，普通组件 CSS 各有 manifest owner，Agent 样式由可选 `themes/agent` 持有
4. 运行 `pnpm sync:registry` 生成 `packages/ui-h5/src` renderer、`packages/ui-weapp/native`、playground 安装源码和文档 Agent 源码/支持目录；不要手改这些投影
5. 用 `pnpm check:generated` 和 `pnpm check:architecture` 检查漂移与依赖边界，再补齐行为验证、双语文档和真实运行证据

H5 无样式 Parts 由 `@varo-ui/h5/primitives` 提供；原生 `@varo-ui/weapp` 包根与 `/components/*` 提供待编译 SFC，不维护另一套 Vue 小程序渲染器。原生全局 CSS 按 [Wevu Registry](/guide/shadcn-mode) 接入。

manifest 的 `targets` / `files.target` 使用 renderer `h5|weapp`；新增平台准入使用精确 `platforms` 列表，并检查所有传递依赖。六个新 profile 保持 experimental；编译产物检查、浏览器演示和真机验证必须分开记录，不能互相替代。

## 提交要求

- 保持 workspace 正式包引用，不使用临时跨包相对路径
- 为核心状态与封装行为补齐 Vitest 单测
- 文档至少覆盖安装、主题、国际化与使用示例
