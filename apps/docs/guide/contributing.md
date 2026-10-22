# 如何贡献

## 推荐落地顺序

1. 在 `packages/primitives-core` 定义平台无关的状态与事件；响应式接口统一在 `packages/shared` 中维护，不得依赖 Vue、Wevu 或 DOM
2. 在 `registry/components/**/*` 编写 H5 renderer 与原生 Wevu SFC；DOM、焦点、键盘与滚动锁定只由 H5 适配层处理
3. 在 `registry/themes/**/*` 维护主题源码；`themes/base` 只包含 tokens 与基础规则，各普通组件的 manifest 声明自身 CSS，Agent 样式放在可选的 `themes/agent` 中
4. 运行 `pnpm sync:registry`，生成 `packages/ui-h5/src` renderer、`packages/ui-weapp/native`、playground 安装源码，以及文档的 Agent 源码和支持目录；不要手动修改这些生成文件
5. 用 `pnpm check:generated` 和 `pnpm check:architecture` 检查生成内容是否一致、依赖是否越界，再补齐行为验证、双语文档和实际运行证据

H5 无样式 Parts 由 `@varo-ui/h5/primitives` 提供；原生 `@varo-ui/weapp` 包根与 `/components/*` 提供待编译 SFC，不维护另一套 Vue 小程序渲染器。原生全局 CSS 按 [Wevu Registry](/guide/shadcn-mode) 接入。

manifest 的 `targets` / `files.target` 使用 renderer `h5|weapp`；其他平台须在 `platforms` 中列出精确 profile，并检查全部传递依赖的支持情况。六个新增 profile 均为 experimental。编译产物检查、浏览器演示和真机验证须分别记录，不能互相替代。

## 提交要求

- 保持 workspace 正式包引用，不使用临时跨包相对路径
- 为核心状态与封装行为补齐 Vitest 单测
- 文档至少覆盖安装、主题、国际化与使用示例
