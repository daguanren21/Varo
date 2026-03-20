# Varo

Varo 是一个面向小程序与 H5 的组件系统仓库，采用 `primitives first` 的产品设计：

- `primitives-*` 提供可直接安装的 headless primitives，支持 `parts + hooks` 双暴露
- `ui-*` 提供建立在 primitives 之上的官方默认组件库
- `theme` 提供 token、主题覆盖与颜色引擎能力

当前仓库处于初始化阶段，首版重点验证：

- 双端架构边界
- token 与主题覆盖模型
- primitives 的交互契约
- 单测与 E2E 的长期接入位
