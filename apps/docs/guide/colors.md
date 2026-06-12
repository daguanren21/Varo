# 色彩系统

Varo 的色彩系统更接近产品组件库而不是营销页面：中性色负责结构，Jade 负责品牌识别，Blue、Amber、Rose、Violet 负责状态与业务强调。色阶组织参考成熟设计系统的“连续色板”思路，但命名、用途和组合方式都围绕 H5 与小程序运行时重写。

<div class="varo-color-system">
  <section class="varo-color-intro">
    <div>
      <h2>Runtime Palette</h2>
      <p>每组颜色提供 10 个阶梯，从浅背景到深色文本都能覆盖。默认界面以 Ink Neutral 为底，Varo Jade 只用于主要操作、焦点和跨端状态同步。</p>
    </div>
    <div class="varo-color-token-card">
      <span>Primary role</span>
      <strong>Varo Jade</strong>
      <code>#13c2c2</code>
    </div>
  </section>
  <section class="varo-color-roles">
    <div class="varo-role-card primary">
      <span>Primary</span>
      <strong>Varo Jade</strong>
      <code>#13c2c2</code>
      <p>主操作、选中态、焦点环。</p>
    </div>
    <div class="varo-role-card success">
      <span>Success</span>
      <strong>Success Green</strong>
      <code>#16a34a</code>
      <p>成功反馈、完成状态、可继续流程。</p>
    </div>
    <div class="varo-role-card warning">
      <span>Warning</span>
      <strong>Warning Amber</strong>
      <code>#f59e0b</code>
      <p>等待、注意、支付确认和可修正风险。</p>
    </div>
    <div class="varo-role-card danger">
      <span>Danger</span>
      <strong>Danger Rose</strong>
      <code>#ef4444</code>
      <p>失败、破坏性动作、不可逆确认。</p>
    </div>
  </section>
  <section class="varo-token-grid">
    <div><span>Text</span><strong>Ink 10</strong><code>#18181b</code></div>
    <div><span>Muted text</span><strong>Ink 6</strong><code>#71717a</code></div>
    <div><span>Background</span><strong>Ink 1</strong><code>#fbfbfa</code></div>
    <div><span>Surface</span><strong>White</strong><code>#ffffff</code></div>
    <div><span>Border</span><strong>Ink 3</strong><code>#e4e4e7</code></div>
    <div><span>Strong border</span><strong>Ink 4</strong><code>#d4d4d8</code></div>
  </section>
  <section class="varo-color-component-system">
    <div>
      <h2>Component States</h2>
      <p>色彩不只存在于色板里。每个语义色都要回答状态提示、边框反馈、文字强调和操作优先级，确保 H5 与小程序 block 可以复用同一套判断。</p>
    </div>
    <div class="varo-color-state-strip">
      <div class="varo-color-state-item primary"><span>Primary</span><strong>主操作</strong><small>选中、聚焦、提交</small></div>
      <div class="varo-color-state-item success"><span>Success</span><strong>成功反馈</strong><small>完成、可继续</small></div>
      <div class="varo-color-state-item warning"><span>Warning</span><strong>等待确认</strong><small>待处理、可修正</small></div>
      <div class="varo-color-state-item danger"><span>Danger</span><strong>风险操作</strong><small>失败、不可逆</small></div>
    </div>
  </section>
  <section class="varo-color-scale">
    <h2>Varo Jade</h2>
    <p>品牌主色。用于主按钮、链接、焦点环、选中态和跨端同步提示。</p>
    <div class="varo-swatch-grid">
      <div class="varo-swatch" style="--swatch:#e6fffb"><span>1</span><code>#e6fffb</code></div>
      <div class="varo-swatch" style="--swatch:#b5f5ec"><span>2</span><code>#b5f5ec</code></div>
      <div class="varo-swatch" style="--swatch:#87e8de"><span>3</span><code>#87e8de</code></div>
      <div class="varo-swatch" style="--swatch:#5cdbd3"><span>4</span><code>#5cdbd3</code></div>
      <div class="varo-swatch" style="--swatch:#36cfc9"><span>5</span><code>#36cfc9</code></div>
      <div class="varo-swatch" style="--swatch:#13c2c2"><span>6</span><code>#13c2c2</code></div>
      <div class="varo-swatch" style="--swatch:#08979c"><span>7</span><code>#08979c</code></div>
      <div class="varo-swatch" style="--swatch:#006d75"><span>8</span><code>#006d75</code></div>
      <div class="varo-swatch" style="--swatch:#00474f"><span>9</span><code>#00474f</code></div>
      <div class="varo-swatch" style="--swatch:#002329"><span>10</span><code>#002329</code></div>
    </div>
  </section>
  <section class="varo-color-scale">
    <h2>Ink Neutral</h2>
    <p>界面骨架。用于背景、边框、文字层级和 shadcn 风格的低噪声面板。</p>
    <div class="varo-swatch-grid">
      <div class="varo-swatch" style="--swatch:#fafafa"><span>1</span><code>#fafafa</code></div>
      <div class="varo-swatch" style="--swatch:#f4f4f5"><span>2</span><code>#f4f4f5</code></div>
      <div class="varo-swatch" style="--swatch:#e4e4e7"><span>3</span><code>#e4e4e7</code></div>
      <div class="varo-swatch" style="--swatch:#d4d4d8"><span>4</span><code>#d4d4d8</code></div>
      <div class="varo-swatch" style="--swatch:#a1a1aa"><span>5</span><code>#a1a1aa</code></div>
      <div class="varo-swatch" style="--swatch:#71717a"><span>6</span><code>#71717a</code></div>
      <div class="varo-swatch" style="--swatch:#52525b"><span>7</span><code>#52525b</code></div>
      <div class="varo-swatch" style="--swatch:#3f3f46"><span>8</span><code>#3f3f46</code></div>
      <div class="varo-swatch" style="--swatch:#27272a"><span>9</span><code>#27272a</code></div>
      <div class="varo-swatch" style="--swatch:#18181b"><span>10</span><code>#18181b</code></div>
    </div>
  </section>
  <section class="varo-color-matrix">
    <div class="varo-color-scale">
      <h2>Success</h2>
      <p>成功、完成、可继续。</p>
      <div class="varo-swatch-grid compact">
        <div class="varo-swatch" style="--swatch:#f0fdf4"><span>1</span><code>#f0fdf4</code></div>
        <div class="varo-swatch" style="--swatch:#dcfce7"><span>2</span><code>#dcfce7</code></div>
        <div class="varo-swatch" style="--swatch:#bbf7d0"><span>3</span><code>#bbf7d0</code></div>
        <div class="varo-swatch" style="--swatch:#86efac"><span>4</span><code>#86efac</code></div>
        <div class="varo-swatch" style="--swatch:#4ade80"><span>5</span><code>#4ade80</code></div>
        <div class="varo-swatch" style="--swatch:#16a34a"><span>6</span><code>#16a34a</code></div>
        <div class="varo-swatch" style="--swatch:#15803d"><span>7</span><code>#15803d</code></div>
        <div class="varo-swatch" style="--swatch:#166534"><span>8</span><code>#166534</code></div>
        <div class="varo-swatch" style="--swatch:#14532d"><span>9</span><code>#14532d</code></div>
        <div class="varo-swatch" style="--swatch:#052e16"><span>10</span><code>#052e16</code></div>
      </div>
    </div>
    <div class="varo-color-scale">
      <h2>Warning</h2>
      <p>等待、警告、支付确认和轻量促销。</p>
      <div class="varo-swatch-grid compact">
        <div class="varo-swatch" style="--swatch:#fffbe6"><span>1</span><code>#fffbe6</code></div>
        <div class="varo-swatch" style="--swatch:#fff1b8"><span>2</span><code>#fff1b8</code></div>
        <div class="varo-swatch" style="--swatch:#ffe58f"><span>3</span><code>#ffe58f</code></div>
        <div class="varo-swatch" style="--swatch:#ffd666"><span>4</span><code>#ffd666</code></div>
        <div class="varo-swatch" style="--swatch:#ffc53d"><span>5</span><code>#ffc53d</code></div>
        <div class="varo-swatch" style="--swatch:#faad14"><span>6</span><code>#faad14</code></div>
        <div class="varo-swatch" style="--swatch:#d48806"><span>7</span><code>#d48806</code></div>
        <div class="varo-swatch" style="--swatch:#ad6800"><span>8</span><code>#ad6800</code></div>
        <div class="varo-swatch" style="--swatch:#874d00"><span>9</span><code>#874d00</code></div>
        <div class="varo-swatch" style="--swatch:#613400"><span>10</span><code>#613400</code></div>
      </div>
    </div>
    <div class="varo-color-scale">
      <h2>Danger</h2>
      <p>危险动作、失败状态、不可逆确认。</p>
      <div class="varo-swatch-grid compact">
        <div class="varo-swatch" style="--swatch:#fff1f0"><span>1</span><code>#fff1f0</code></div>
        <div class="varo-swatch" style="--swatch:#ffccc7"><span>2</span><code>#ffccc7</code></div>
        <div class="varo-swatch" style="--swatch:#ffa39e"><span>3</span><code>#ffa39e</code></div>
        <div class="varo-swatch" style="--swatch:#ff7875"><span>4</span><code>#ff7875</code></div>
        <div class="varo-swatch" style="--swatch:#ff4d4f"><span>5</span><code>#ff4d4f</code></div>
        <div class="varo-swatch" style="--swatch:#f5222d"><span>6</span><code>#f5222d</code></div>
        <div class="varo-swatch" style="--swatch:#cf1322"><span>7</span><code>#cf1322</code></div>
        <div class="varo-swatch" style="--swatch:#a8071a"><span>8</span><code>#a8071a</code></div>
        <div class="varo-swatch" style="--swatch:#820014"><span>9</span><code>#820014</code></div>
        <div class="varo-swatch" style="--swatch:#5c0011"><span>10</span><code>#5c0011</code></div>
      </div>
    </div>
    <div class="varo-color-scale">
      <h2>Violet</h2>
      <p>高级能力、实验区、AI 或自动化状态。</p>
      <div class="varo-swatch-grid compact">
        <div class="varo-swatch" style="--swatch:#f9f0ff"><span>1</span><code>#f9f0ff</code></div>
        <div class="varo-swatch" style="--swatch:#efdbff"><span>2</span><code>#efdbff</code></div>
        <div class="varo-swatch" style="--swatch:#d3adf7"><span>3</span><code>#d3adf7</code></div>
        <div class="varo-swatch" style="--swatch:#b37feb"><span>4</span><code>#b37feb</code></div>
        <div class="varo-swatch" style="--swatch:#9254de"><span>5</span><code>#9254de</code></div>
        <div class="varo-swatch" style="--swatch:#722ed1"><span>6</span><code>#722ed1</code></div>
        <div class="varo-swatch" style="--swatch:#531dab"><span>7</span><code>#531dab</code></div>
        <div class="varo-swatch" style="--swatch:#391085"><span>8</span><code>#391085</code></div>
        <div class="varo-swatch" style="--swatch:#22075e"><span>9</span><code>#22075e</code></div>
        <div class="varo-swatch" style="--swatch:#120338"><span>10</span><code>#120338</code></div>
      </div>
    </div>
  </section>
</div>

## 使用建议

- 主操作使用 Jade 6，hover/active 使用 Jade 7/8，浅背景使用 Jade 1/2。
- 页面结构优先使用 Ink Neutral，避免整页被品牌色覆盖。
- 小程序 blocks 内的状态色只用于局部块，不作为大面积背景。
- 暗色模式优先调换文字和背景阶梯，不改变语义色名称。
