# Primitives

Primitives 不是另一套 UI 组件清单，而是 Varo 的运行时契约：它们定义状态、触发器、遮罩、定位与关闭行为，让 H5 与小程序封装共享同一套交互语义。展示类组件继续留在组件文档；这里只保留会影响行为组合的底层能力。

<div class="varo-primitive-stack">
  <section>
    <span>01</span>
    <h2>运行时契约</h2>
    <p>Root 负责状态与上下文，Trigger 负责入口，Content/Overlay 负责可见层，Close 负责退出动作。平台可以换渲染细节，但不能改变契约。</p>
  </section>
  <section>
    <span>02</span>
    <h2>组合顺序</h2>
    <p>先放 Root，再放 Trigger，然后放 Overlay 与 Content。组合顺序稳定后，业务 blocks 才能在 H5 和小程序间保持一致。</p>
  </section>
  <section>
    <span>03</span>
    <h2>受控与非受控</h2>
    <p>简单场景使用内部状态；需要埋点、路由同步或表单联动时，切换到受控写法。</p>
  </section>
</div>

## 目录

按能力浏览 P0/P1 primitives。每个页面都包含 H5 实时预览、小程序运行时契约、可复制代码与 API。

<PrimitiveCatalog locale="zh" />

## 产品边界

- **primitive** 管行为契约：受控/非受控状态、disabled、ARIA、`data-*` 与 dismiss 事件。
- **UI wrapper** 管视觉与定位：token、动画、图标、浮层位置与平台渲染细节。
- **业务 wrapper** 管数据与场景：远程搜索、权限、分页、领域模型与业务文案。

这个分层让 Base Kit 源码保持可读可改；团队可以基于相同 primitives 创建自己的 UI 包和业务组件，而不需要复制状态机。

## 开发约定

- H5 与小程序使用同一套 part 名称与状态模型。
- 同一 `TabsRoot` / `AccordionRoot` 内的 value 必须唯一。
- 小程序页不把浏览器渲染伪装成真实小程序预览；文档用「运行时契约」说明差异。
- 自定义业务 UI 请从 primitives 向上封装，或参考 [组件文档](/components/button) 与后续 Blocks 作者指南。

## 相关文档

- [安装指南](/guide/installation)
- [主题配置](/guide/theme)
- [组件文档](/components/button)
- [跨端演示](/examples/)
