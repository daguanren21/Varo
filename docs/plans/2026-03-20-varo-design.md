# Varo Design

## Summary

Varo 采用 `primitives first` 的产品策略，目标是同时提供：

- 可直接安装、可二次封装的跨端 primitives
- 建立在 primitives 之上的官方默认 UI
- 支撑小程序与 H5 的主题与 token 系统

## Product Layers

对外产品层分为五个包：

- `@varo/primitives-weapp`
- `@varo/primitives-h5`
- `@varo/theme`
- `@varo/ui-weapp`
- `@varo/ui-h5`

内部允许存在 `primitives-core` 作为实现分层，但不作为主要产品心智。

## Architecture

仓库采用 monorepo 组织，工程化基线参考 `pnpm workspace + turbo + changesets + vitest`。

依赖方向保持单向：

1. `shared` 提供跨包工具与类型
2. `primitives-core` 提供状态机、上下文、交互协议
3. `primitives-weapp` / `primitives-h5` 提供 `parts + hooks`
4. `theme` 提供 token、provider、theme overrides
5. `ui-weapp` / `ui-h5` 只建立在对应的 primitives 与 theme 之上

## API Strategy

每个 primitives 组件同时提供两种入口：

- `part components`
- `hooks`

文档主推模板友好的 part 组件写法，同时保证 hooks 是一等公民，方便公司内部二次封装。

## Theme Strategy

主题系统采用四层模型：

1. `seed`
2. `palette`
3. `semantic tokens`
4. `component tokens`

renderer 与 official UI 只消费 semantic/component token，不直接依赖 palette 细节。

## Initial Scope

首批组件优先级：

1. Button / Pressable
2. Text / Icon / Space
3. Dialog
4. Tabs
5. Input / Field / FormItem
6. Toast / Popover / Collapse

## Documentation Experience

组件文档与示例页采用统一约束：

- 每个组件页必须同时包含可复制的示例代码与演示效果
- `H5` 与 `Weapp` 内容放在同一文档块中，通过 tabs 切换查看
- 不再把同一组件的双端示例拆成两篇独立文档
- 平台差异说明写在同一页内，优先强调共享交互契约，再补充运行时差异

## Testing

稳定性要求从初始化阶段开始建立：

- `theme` 单测
- `primitives-core` hooks contract tests
- `primitives-*` parts integration tests
- `ui-*` 行为与视觉回归测试
- `H5` Playwright E2E
- `Weapp` 示例工程构建冒烟与关键交互冒烟
