# 色彩系统

Varo 使用角色化色板：每个品牌色和语义色都提供 **Dark / Base / Light / Soft** 四个稳定层级；文字、边框、填充和背景使用独立的中性色阶。组件只读取语义变量，不自行混色。

<div class="varo-color-system">
  <section class="varo-color-intro">
    <div>
      <h2>Runtime Palette</h2>
      <p>Base 用于实心状态，Dark 用于按下或强调，Light 用于 hover，Soft 用于弱背景。H5 与小程序共享相同变量和值。</p>
    </div>
    <div class="varo-color-token-card">
      <span>Primary</span>
      <strong>WeChat Green</strong>
      <code>#07C160</code>
    </div>
  </section>
  <section class="varo-color-roles">
    <div class="varo-role-card primary"><span>Primary</span><strong>#07C160</strong><code>Dark #06AD56 · Light #38CD80 · Soft #E6F9EF</code><p>微信主色，用于主操作、链接、选中和焦点。</p></div>
    <div class="varo-role-card success"><span>Success</span><strong>#13B248</strong><code>Dark #10973D · Light #42C16D · Soft #E7F7EC</code><p>完成、通过和可继续。</p></div>
    <div class="varo-role-card warning"><span>Warning</span><strong>#FA9200</strong><code>Dark #D57C00 · Light #FBA833 · Soft #FEF4E5</code><p>等待确认和可恢复风险。</p></div>
    <div class="varo-role-card danger"><span>Danger</span><strong>#EB3437</strong><code>Dark #C82C2F · Light #EF5D5F · Soft #FDEAEB</code><p>失败、删除和不可逆操作。</p></div>
  </section>
  <section class="varo-color-component-system">
    <div><h2>Component States</h2><p>组件通过 Base、Light 和 Soft 变量表达默认、hover 与弱提示，不再使用无语义的通用灰色覆盖 tone。</p></div>
    <div class="varo-color-state-strip">
      <div class="varo-color-state-item primary"><span>Primary</span><strong>默认 / Hover</strong><small>#07C160 → #38CD80</small></div>
      <div class="varo-color-state-item success"><span>Success</span><strong>完成 / 弱提示</strong><small>#13B248 / #E7F7EC</small></div>
      <div class="varo-color-state-item warning"><span>Warning</span><strong>警告 / 弱提示</strong><small>#FA9200 / #FEF4E5</small></div>
      <div class="varo-color-state-item danger"><span>Danger</span><strong>危险 / 弱提示</strong><small>#EB3437 / #FDEAEB</small></div>
    </div>
  </section>
  <section class="varo-color-matrix">
    <div class="varo-color-scale"><h2>Primary</h2><div class="varo-swatch-grid compact"><div class="varo-swatch" style="--swatch:#06ad56"><span>Dark</span><code>#06AD56</code></div><div class="varo-swatch" style="--swatch:#07c160"><span>Base</span><code>#07C160</code></div><div class="varo-swatch" style="--swatch:#38cd80"><span>Light</span><code>#38CD80</code></div><div class="varo-swatch" style="--swatch:#e6f9ef"><span>Soft</span><code>#E6F9EF</code></div></div></div>
    <div class="varo-color-scale"><h2>Success</h2><div class="varo-swatch-grid compact"><div class="varo-swatch" style="--swatch:#10973d"><span>Dark</span><code>#10973D</code></div><div class="varo-swatch" style="--swatch:#13b248"><span>Base</span><code>#13B248</code></div><div class="varo-swatch" style="--swatch:#42c16d"><span>Light</span><code>#42C16D</code></div><div class="varo-swatch" style="--swatch:#e7f7ec"><span>Soft</span><code>#E7F7EC</code></div></div></div>
    <div class="varo-color-scale"><h2>Warning</h2><div class="varo-swatch-grid compact"><div class="varo-swatch" style="--swatch:#d57c00"><span>Dark</span><code>#D57C00</code></div><div class="varo-swatch" style="--swatch:#fa9200"><span>Base</span><code>#FA9200</code></div><div class="varo-swatch" style="--swatch:#fba833"><span>Light</span><code>#FBA833</code></div><div class="varo-swatch" style="--swatch:#fef4e5"><span>Soft</span><code>#FEF4E5</code></div></div></div>
    <div class="varo-color-scale"><h2>Danger</h2><div class="varo-swatch-grid compact"><div class="varo-swatch" style="--swatch:#c82c2f"><span>Dark</span><code>#C82C2F</code></div><div class="varo-swatch" style="--swatch:#eb3437"><span>Base</span><code>#EB3437</code></div><div class="varo-swatch" style="--swatch:#ef5d5f"><span>Light</span><code>#EF5D5F</code></div><div class="varo-swatch" style="--swatch:#fdeaeb"><span>Soft</span><code>#FDEAEB</code></div></div></div>
  </section>
  <section class="varo-token-grid">
    <div><span>Primary Text</span><strong>#303133</strong><code>--varo-ui-text</code></div>
    <div><span>Regular Text</span><strong>#606266</strong><code>--varo-ui-text-regular</code></div>
    <div><span>Secondary Text</span><strong>#909399</strong><code>--varo-ui-text-muted</code></div>
    <div><span>Placeholder</span><strong>#A8ABB2</strong><code>--varo-ui-text-placeholder</code></div>
    <div><span>Base Border</span><strong>#DCDFE6</strong><code>--varo-ui-border</code></div>
    <div><span>Base Fill</span><strong>#F0F2F5</strong><code>--varo-ui-fill</code></div>
    <div><span>Page Background</span><strong>#F2F3F5</strong><code>--varo-ui-bg</code></div>
    <div><span>Surface</span><strong>#FFFFFF</strong><code>--varo-ui-surface</code></div>
  </section>
</div>

## 使用建议

- 实心组件使用 Base；hover 使用 Light；按下或高强调使用 Dark。
- Soft 只作为弱背景，文字和边框仍使用对应语义 Base。
- 正文、次级信息、占位符和禁用态分别使用独立文字变量。
- 边框和填充不得用透明度临时推导；优先使用已定义层级。
- 暗色模式保留相同语义色，重新映射文字、边框、填充和背景层级。
