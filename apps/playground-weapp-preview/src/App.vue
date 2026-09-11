<script setup lang="ts">
import type { PreviewScenarioId } from './protocol'
import { computed, shallowRef } from 'vue'
import PreviewFrame from './components/PreviewFrame.vue'
import PreviewToolbar from './components/PreviewToolbar.vue'
import { previewScenarios } from './protocol'

type PreviewWidth = 320 | 390 | 430

const scenario = shallowRef<PreviewScenarioId>('controls')
const width = shallowRef<PreviewWidth>(390)
const session = shallowRef(globalThis.crypto.randomUUID())

const activeScenario = computed(() =>
  previewScenarios.find(item => item.id === scenario.value) ?? previewScenarios[0],
)

function renewSession() {
  session.value = globalThis.crypto.randomUUID()
}

function selectScenario(nextScenario: PreviewScenarioId) {
  if (nextScenario === scenario.value) {
    return
  }

  scenario.value = nextScenario
  renewSession()
}

function selectWidth(nextWidth: PreviewWidth) {
  width.value = nextWidth
}
</script>

<template>
  <div class="preview-app">
    <header class="preview-app__header">
      <div class="preview-app__heading">
        <p class="preview-app__eyebrow">
          Varo · Weapp artifact lab
        </p>
        <h1>小程序 Web 兼容预览</h1>
        <p class="preview-app__intro">
          直接装载 Wevu 原生构建产物，在浏览器中检查组件交互与 Agent 内容表现。
        </p>
      </div>

      <dl class="preview-app__facts" aria-label="预览运行信息">
        <div>
          <dt>构建来源</dt>
          <dd>Wevu native</dd>
        </div>
        <div>
          <dt>渲染框架</dt>
          <dd>glass-easel</dd>
        </div>
        <div>
          <dt>当前页面</dt>
          <dd><code>{{ activeScenario.page }}</code></dd>
        </div>
      </dl>
    </header>

    <section class="preview-app__notice" role="note" aria-labelledby="compatibility-heading">
      <p class="preview-app__notice-label">
        使用边界
      </p>
      <div>
        <h2 id="compatibility-heading">
          这是 Web 兼容预览，不是真实微信客户端模拟器
        </h2>
        <p>
          页面使用官方 glass-easel 框架运行实际 Wevu 构建产物。微信专属 API、登录、支付与扫码能力不会在这里伪造；外层 Vue 工具栏也不会替代预览中的原生交互。
        </p>
      </div>
    </section>

    <main class="preview-app__workspace">
      <aside class="preview-app__controls" aria-label="预览控制台">
        <PreviewToolbar
          :scenario="scenario"
          :width="width"
          @reset="renewSession"
          @select-scenario="selectScenario"
          @select-width="selectWidth"
        />
      </aside>

      <section class="preview-app__surface" aria-labelledby="preview-surface-heading">
        <header class="preview-app__surface-heading">
          <div>
            <p class="preview-app__eyebrow">
              Native runtime
            </p>
            <h2 id="preview-surface-heading">
              {{ activeScenario.title }}
            </h2>
          </div>
          <p>{{ activeScenario.description }}</p>
        </header>

        <PreviewFrame
          :scenario="scenario"
          :session="session"
          :width="width"
          @reset="renewSession"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.preview-app {
  width: min(1240px, calc(100% - 40px));
  min-width: 0;
  padding: 36px 0 56px;
  margin: 0 auto;
}

.preview-app__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.56fr);
  gap: 32px;
  align-items: end;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--varo-ui-border);
}

.preview-app__heading {
  min-width: 0;
}

.preview-app__eyebrow,
.preview-app__notice-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  color: var(--varo-ui-primary-text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.preview-app__heading h1 {
  margin: 0;
  font-size: clamp(32px, 5vw, 54px);
  line-height: 1.04;
  letter-spacing: -0.045em;
}

.preview-app__intro {
  max-width: 620px;
  margin: 16px 0 0;
  font-size: 17px;
  line-height: 1.7;
  color: var(--varo-ui-text-regular);
}

.preview-app__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: var(--varo-ui-border-light);
  border: 1px solid var(--varo-ui-border-light);
  border-radius: calc(var(--varo-ui-radius) + 4px);
}

.preview-app__facts div {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 13px 14px;
  background: var(--varo-ui-surface);
}

.preview-app__facts div:last-child {
  grid-column: 1 / -1;
}

.preview-app__facts dt {
  font-size: 11px;
  font-weight: 700;
  color: var(--varo-ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.preview-app__facts dd {
  min-width: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--varo-ui-text);
  overflow-wrap: anywhere;
}

.preview-app__facts code {
  font: inherit;
}

.preview-app__notice {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 24px;
  padding: 20px 22px;
  margin: 24px 0 30px;
  color: var(--varo-ui-warning-text);
  background: var(--varo-ui-warning-soft);
  border: 1px solid var(--varo-ui-warning);
  border-left-width: 5px;
  border-radius: var(--varo-ui-radius);
}

.preview-app__notice-label {
  margin: 3px 0 0;
  color: inherit;
}

.preview-app__notice h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.preview-app__notice p:last-child {
  max-width: 84ch;
  margin: 8px 0 0;
  line-height: 1.65;
}

.preview-app__workspace {
  display: grid;
  grid-template-columns: minmax(270px, 320px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  min-width: 0;
}

.preview-app__controls {
  position: sticky;
  top: 20px;
  min-width: 0;
}

.preview-app__surface {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.preview-app__surface-heading {
  display: flex;
  gap: 24px;
  align-items: end;
  justify-content: space-between;
  min-width: 0;
}

.preview-app__surface-heading > div {
  min-width: 0;
}

.preview-app__surface-heading h2 {
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -0.03em;
}

.preview-app__surface-heading > p {
  max-width: 400px;
  margin: 0;
  line-height: 1.55;
  color: var(--varo-ui-text-regular);
  text-align: right;
}

@media (max-width: 900px) {
  .preview-app__header,
  .preview-app__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .preview-app__header {
    align-items: start;
  }

  .preview-app__facts {
    max-width: 520px;
  }

  .preview-app__controls {
    position: static;
  }
}

@media (max-width: 620px) {
  .preview-app {
    width: min(100% - 24px, 1240px);
    padding: 22px 0 36px;
  }

  .preview-app__header {
    gap: 22px;
    padding-bottom: 22px;
  }

  .preview-app__heading h1 {
    font-size: clamp(30px, 11vw, 42px);
  }

  .preview-app__intro {
    font-size: 15px;
  }

  .preview-app__notice {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
    padding: 18px;
    margin: 18px 0 24px;
  }

  .preview-app__notice-label {
    margin: 0 0 5px;
  }

  .preview-app__workspace {
    gap: 26px;
  }

  .preview-app__surface-heading {
    display: grid;
    gap: 8px;
  }

  .preview-app__surface-heading > p {
    text-align: left;
  }
}
</style>
