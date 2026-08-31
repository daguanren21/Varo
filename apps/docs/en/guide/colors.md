# Color System

Varo borrows the layered palette method without copying another product's brand. The default primary remains **WeChat Green**. Every brand and semantic color exposes stable **Dark / Base / Light / Soft** levels, while text, border, fill, and background use independent neutral scales.

<div class="varo-color-system">
  <section class="varo-color-intro">
    <div><h2>Runtime Palette</h2><p>Base is the solid state, Dark is pressed or emphasized, Light is hover, and Soft is the quiet background. H5 and mini-program runtimes share the same contract.</p></div>
    <div class="varo-color-token-card"><span>Primary</span><strong>WeChat Green</strong><code>#07C160</code></div>
  </section>
  <section class="varo-color-roles">
    <div class="varo-role-card primary"><span>Primary</span><strong>#07C160</strong><code>Dark #06AD56 · Light #38CD80 · Soft #E6F9EF</code><p>WeChat primary for actions, links, selection, and focus.</p></div>
    <div class="varo-role-card success"><span>Success</span><strong>#13B248</strong><code>Dark #10973D · Light #42C16D · Soft #E7F7EC</code><p>Completion, approval, and continuation.</p></div>
    <div class="varo-role-card warning"><span>Warning</span><strong>#FA9200</strong><code>Dark #D57C00 · Light #FBA833 · Soft #FEF4E5</code><p>Attention and recoverable risk.</p></div>
    <div class="varo-role-card danger"><span>Danger</span><strong>#EB3437</strong><code>Dark #C82C2F · Light #EF5D5F · Soft #FDEAEB</code><p>Failure, deletion, and irreversible action.</p></div>
  </section>
  <section class="varo-color-component-system">
    <div><h2>Component States</h2><p>Components use Base, Light, and Soft for default, hover, and quiet feedback. Variants never replace a semantic tone with generic gray.</p></div>
    <div class="varo-color-state-strip">
      <div class="varo-color-state-item primary"><span>Primary</span><strong>Default / Hover</strong><small>#07C160 → #38CD80</small></div>
      <div class="varo-color-state-item success"><span>Success</span><strong>Complete / Soft</strong><small>#13B248 / #E7F7EC</small></div>
      <div class="varo-color-state-item warning"><span>Warning</span><strong>Attention / Soft</strong><small>#FA9200 / #FEF4E5</small></div>
      <div class="varo-color-state-item danger"><span>Danger</span><strong>Risk / Soft</strong><small>#EB3437 / #FDEAEB</small></div>
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

## Usage Notes

- Solid components use Base, hover uses Light, and pressed or emphasized states use Dark.
- Soft is only a quiet background; text and borders keep the matching semantic Base color.
- Body, secondary, placeholder, and disabled text use separate neutral roles.
- Borders and fills use named levels rather than ad-hoc opacity.
- Dark mode retains semantic colors and remaps text, border, fill, and background levels.
