# Color System

Varo uses a **Perceptual Neutral** theme model: neutrals carry space and hierarchy, while Varo Teal is reserved for actions, selection, focus, and brand. Light and dark appearances are mapped independently instead of being inverted, and components consume semantic roles rather than raw scale values.

<div class="varo-color-system">
  <section class="varo-color-intro">
    <div>
      <h2>Semantic first</h2>
      <p>A 12-step neutral scale describes backgrounds, component states, borders, and text before mapping to semantic tokens such as canvas, surface, text, border, and focus.</p>
    </div>
    <div class="varo-color-token-card">
      <span>Accent role</span><strong>Varo Teal</strong><code>#0f766e / #5cc8be</code>
    </div>
  </section>

  <section class="varo-color-roles">
    <div class="varo-role-card primary"><span>Accent</span><strong>Varo Teal</strong><code>#0f766e</code><p>Primary actions, selection, links, and focus.</p></div>
    <div class="varo-role-card success"><span>Success</span><strong>Success Green</strong><code>#15803d</code><p>Completion, success, and flows that can continue.</p></div>
    <div class="varo-role-card warning"><span>Warning</span><strong>Warning Amber</strong><code>#a85d00</code><p>Pending states, attention, and recoverable risk.</p></div>
    <div class="varo-role-card danger"><span>Danger</span><strong>Danger Red</strong><code>#bd3f38</code><p>Failure, destructive, and irreversible actions.</p></div>
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
    <div><h2>Component states</h2><p>Default, hover, pressed, selected, disabled, focus, loading, and error each have explicit roles. Color is never the only state indicator.</p></div>
    <div class="varo-color-state-strip">
      <div class="varo-color-state-item primary"><span>Selected</span><strong>Accent soft</strong><small>Text, surface, and border move together</small></div>
      <div class="varo-color-state-item success"><span>Success</span><strong>Icon + label</strong><small>Color is not the only signal</small></div>
      <div class="varo-color-state-item warning"><span>Warning</span><strong>Explain + recover</strong><small>Risk stays understandable</small></div>
      <div class="varo-color-state-item danger"><span>Danger</span><strong>Separate the action</strong><small>Irreversible work needs confirmation</small></div>
    </div>
  </section>

  <section class="varo-color-scale">
    <h2>Light neutral</h2><p>Light mode builds structure with a stable gray scale; interactive borders are stronger than decorative dividers.</p>
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
    <h2>Dark neutral</h2><p>Dark mode remaps lightness and chroma to prevent pure black, pure white, and saturated color from competing.</p>
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
    <div class="varo-color-scale"><h2>Text</h2><p>Body text meets WCAG 2.2 AA and uses APCA as a perceptual dark-mode check.</p></div>
    <div class="varo-color-scale"><h2>Boundary</h2><p>Interactive boundaries and focus rings reach 3:1 while decorative dividers remain quiet.</p></div>
    <div class="varo-color-scale"><h2>State</h2><p>Success, warning, and error pair color with an icon, label, or structural change.</p></div>
    <div class="varo-color-scale"><h2>Motion</h2><p>Color changes use the 120ms state token; appearance switching never adds large spatial motion.</p></div>
  </section>
</div>

## Usage Notes

- Use Neutral 1–6 for structure, 7–8 for interactive boundaries, and 11–12 for text.
- Reserve Accent for primary actions, focus, links, and selected states instead of large surfaces.
- Test body text, secondary text, interactive boundaries, and semantic states independently in dark mode.
- Treat WCAG 2.2 AA as the hard requirement and APCA as an additional perceptual check.
