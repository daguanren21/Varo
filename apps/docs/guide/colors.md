# 色彩系统

Varo 使用 **Perceptual Neutral / 知觉中性** 主题模型：中性色承担空间和层级，Varo Teal 只承担操作、选择、焦点和品牌。明暗主题分别映射，不做颜色反相，也不让组件直接消费原始色阶。

<div class="varo-color-system">
  <section class="varo-color-intro">
    <div>
      <h2>Semantic first</h2>
      <p>12 级 neutral scale 先描述背景、组件状态、边框和文字，再映射为 canvas、surface、text、border 与 focus 等语义 token。每个组件只使用语义角色。</p>
    </div>
    <div class="varo-color-token-card">
      <span>Accent role</span>
      <strong>Varo Teal</strong>
      <code>#0f766e / #5cc8be</code>
    </div>
  </section>

  <section class="varo-color-roles">
    <div class="varo-role-card primary">
      <span>Accent</span><strong>Varo Teal</strong><code>#0f766e</code><p>主操作、选中态、链接与焦点。</p>
    </div>
    <div class="varo-role-card success">
      <span>Success</span><strong>Success Green</strong><code>#15803d</code><p>完成、成功和可继续流程。</p>
    </div>
    <div class="varo-role-card warning">
      <span>Warning</span><strong>Warning Amber</strong><code>#a85d00</code><p>等待、注意和可修正风险。</p>
    </div>
    <div class="varo-role-card danger">
      <span>Danger</span><strong>Danger Red</strong><code>#bd3f38</code><p>失败、破坏性和不可逆操作。</p>
    </div>
  </section>

  <section class="varo-token-grid">
    <div><span>Canvas</span><strong>Neutral 1</strong><code>#f7f8fa / #0c1117</code></div>
    <div><span>Surface</span><strong>Neutral 3</strong><code>#ffffff / #151d26</code></div>
    <div><span>Text</span><strong>Neutral 12</strong><code>#1b2430 / #e4eaf0</code></div>
    <div><span>Muted text</span><strong>Neutral 11</strong><code>#526173 / #a6b2bf</code></div>
    <div><span>Border</span><strong>Neutral 6</strong><code>#dde3ea / #2b3847</code></div>
    <div><span>Interactive border</span><strong>Neutral 8</strong><code>#8494a5 / #637488</code></div>
  </section>

  <section class="varo-color-component-system">
    <div>
      <h2>Component states</h2>
      <p>默认、hover、pressed、selected、disabled、focus、loading 和 error 均有明确角色；状态不能只靠颜色表达。</p>
    </div>
    <div class="varo-color-state-strip">
      <div class="varo-color-state-item primary"><span>Selected</span><strong>Accent soft</strong><small>文字、背景和边框共同变化</small></div>
      <div class="varo-color-state-item success"><span>Success</span><strong>图标 + 文案</strong><small>颜色不是唯一信息</small></div>
      <div class="varo-color-state-item warning"><span>Warning</span><strong>说明 + 恢复</strong><small>风险必须可理解</small></div>
      <div class="varo-color-state-item danger"><span>Danger</span><strong>分离危险操作</strong><small>不可逆动作需确认</small></div>
    </div>
  </section>

  <section class="varo-color-scale">
    <h2>Light neutral</h2>
    <p>亮色模式通过稳定的灰阶建立结构；交互边框强于装饰边框。</p>
    <div class="varo-swatch-grid">
      <div class="varo-swatch" style="--swatch:#f7f8fa"><span>1</span><code>#f7f8fa</code></div>
      <div class="varo-swatch" style="--swatch:#f2f4f7"><span>2</span><code>#f2f4f7</code></div>
      <div class="varo-swatch" style="--swatch:#ffffff"><span>3</span><code>#ffffff</code></div>
      <div class="varo-swatch" style="--swatch:#eef1f4"><span>4</span><code>#eef1f4</code></div>
      <div class="varo-swatch" style="--swatch:#e6ebf0"><span>5</span><code>#e6ebf0</code></div>
      <div class="varo-swatch" style="--swatch:#dde3ea"><span>6</span><code>#dde3ea</code></div>
      <div class="varo-swatch" style="--swatch:#b8c3ce"><span>7</span><code>#b8c3ce</code></div>
      <div class="varo-swatch" style="--swatch:#8494a5"><span>8</span><code>#8494a5</code></div>
      <div class="varo-swatch" style="--swatch:#7b8794"><span>9</span><code>#7b8794</code></div>
      <div class="varo-swatch" style="--swatch:#6e7a87"><span>10</span><code>#6e7a87</code></div>
      <div class="varo-swatch" style="--swatch:#526173"><span>11</span><code>#526173</code></div>
      <div class="varo-swatch" style="--swatch:#1b2430"><span>12</span><code>#1b2430</code></div>
    </div>
  </section>

  <section class="varo-color-scale">
    <h2>Dark neutral</h2>
    <p>暗色模式重新分配明度与色度，避免纯黑、纯白和大面积高饱和色互相竞争。</p>
    <div class="varo-swatch-grid">
      <div class="varo-swatch" style="--swatch:#0c1117"><span>1</span><code>#0c1117</code></div>
      <div class="varo-swatch" style="--swatch:#10171f"><span>2</span><code>#10171f</code></div>
      <div class="varo-swatch" style="--swatch:#151d26"><span>3</span><code>#151d26</code></div>
      <div class="varo-swatch" style="--swatch:#1a2530"><span>4</span><code>#1a2530</code></div>
      <div class="varo-swatch" style="--swatch:#21303c"><span>5</span><code>#21303c</code></div>
      <div class="varo-swatch" style="--swatch:#2b3847"><span>6</span><code>#2b3847</code></div>
      <div class="varo-swatch" style="--swatch:#3a4b5d"><span>7</span><code>#3a4b5d</code></div>
      <div class="varo-swatch" style="--swatch:#637488"><span>8</span><code>#637488</code></div>
      <div class="varo-swatch" style="--swatch:#6b7c90"><span>9</span><code>#6b7c90</code></div>
      <div class="varo-swatch" style="--swatch:#7a8b9d"><span>10</span><code>#7a8b9d</code></div>
      <div class="varo-swatch" style="--swatch:#a6b2bf"><span>11</span><code>#a6b2bf</code></div>
      <div class="varo-swatch" style="--swatch:#e4eaf0"><span>12</span><code>#e4eaf0</code></div>
    </div>
  </section>

  <section class="varo-color-matrix">
    <div class="varo-color-scale"><h2>Text</h2><p>正文遵守 WCAG 2.2 AA，并使用 APCA 辅助检查暗色知觉对比度。</p></div>
    <div class="varo-color-scale"><h2>Boundary</h2><p>交互边界和焦点环达到 3:1；装饰 divider 保持安静。</p></div>
    <div class="varo-color-scale"><h2>State</h2><p>成功、警告和错误同时提供图标、文字或结构变化。</p></div>
    <div class="varo-color-scale"><h2>Motion</h2><p>颜色变化使用 120ms 状态 token；主题切换不播放大面积位移动画。</p></div>
  </section>
</div>

## 使用建议

- 页面骨架使用 Neutral 1–6；交互边界使用 7–8；文字使用 11–12。
- Accent 只用于主要操作、焦点、链接和选中态，不用于大面积背景。
- 暗色主题必须独立测试正文、次级文字、交互边界和语义状态。
- 正文以 WCAG 2.2 AA 为硬门槛，并用 APCA 作为知觉检查补充。
