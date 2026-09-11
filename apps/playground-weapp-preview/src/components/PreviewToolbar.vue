<script setup lang="ts">
import type { PreviewScenarioId } from '../protocol'
import { VButton } from '@varo-ui/h5'
import { previewScenarios } from '../protocol'

type PreviewWidth = 320 | 390 | 430

interface Props {
  scenario: PreviewScenarioId
  width: PreviewWidth
}

interface Emits {
  reset: []
  selectScenario: [scenario: PreviewScenarioId]
  selectWidth: [width: PreviewWidth]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const deviceWidths = [
  { value: 320, label: '紧凑', detail: '320 px' },
  { value: 390, label: '标准', detail: '390 px' },
  { value: 430, label: '宽屏', detail: '430 px' },
] as const
</script>

<template>
  <div class="preview-toolbar">
    <header class="preview-toolbar__header">
      <p>Preview controls</p>
      <h2>预览设置</h2>
      <span>使用 Tab 与方向键可完成全部选择。</span>
    </header>

    <fieldset class="preview-toolbar__group" aria-describedby="scenario-help">
      <legend>场景</legend>
      <p id="scenario-help">
        切换场景会启动全新的运行会话。
      </p>

      <div class="preview-toolbar__scenario-list">
        <label v-for="item in previewScenarios" :key="item.id" class="preview-toolbar__scenario">
          <input
            class="preview-toolbar__control"
            type="radio"
            name="preview-scenario"
            :value="item.id"
            :checked="props.scenario === item.id"
            @change="emit('selectScenario', item.id)"
          >
          <span class="preview-toolbar__scenario-surface">
            <strong>{{ item.title }}</strong>
            <span>{{ item.description }}</span>
          </span>
        </label>
      </div>
    </fieldset>

    <fieldset class="preview-toolbar__group" aria-describedby="width-help">
      <legend>设备宽度</legend>
      <p id="width-help">
        仅改变预览视口，不重置当前会话。
      </p>

      <div class="preview-toolbar__width-list">
        <label v-for="option in deviceWidths" :key="option.value" class="preview-toolbar__width">
          <input
            class="preview-toolbar__control"
            type="radio"
            name="preview-width"
            :value="option.value"
            :checked="props.width === option.value"
            @change="emit('selectWidth', option.value)"
          >
          <span class="preview-toolbar__width-surface">
            <strong>{{ option.label }}</strong>
            <span>{{ option.detail }}</span>
          </span>
        </label>
      </div>
    </fieldset>

    <div class="preview-toolbar__reset">
      <VButton block native-type="button" tone="default" variant="outline" @click="emit('reset')">
        重置当前预览
      </VButton>
      <p>重新创建 iframe 与会话，当前原生页面状态会被清除。</p>
    </div>
  </div>
</template>

<style scoped>
.preview-toolbar {
  display: grid;
  gap: 22px;
  min-width: 0;
  padding: 20px;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: calc(var(--varo-ui-radius) + 6px);
  box-shadow: var(--varo-ui-shadow-sm);
}

.preview-toolbar__header {
  display: grid;
  gap: 5px;
}

.preview-toolbar__header p {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--varo-ui-primary-text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.preview-toolbar__header h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.025em;
}

.preview-toolbar__header span,
.preview-toolbar__group > p,
.preview-toolbar__reset p {
  font-size: 12px;
  line-height: 1.55;
  color: var(--varo-ui-text-muted);
}

.preview-toolbar__group {
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
}

.preview-toolbar__group legend {
  padding: 0;
  font-size: 13px;
  font-weight: 800;
  color: var(--varo-ui-text);
}

.preview-toolbar__group > p {
  margin: 5px 0 10px;
}

.preview-toolbar__scenario-list {
  display: grid;
  gap: 8px;
}

.preview-toolbar__scenario,
.preview-toolbar__width {
  position: relative;
  min-width: 0;
  cursor: pointer;
}

.preview-toolbar__control {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

.preview-toolbar__scenario-surface,
.preview-toolbar__width-surface {
  display: grid;
  min-width: 0;
  color: var(--varo-ui-text-regular);
  background: var(--varo-ui-surface-muted);
  border: 1px solid var(--varo-ui-border-light);
}

.preview-toolbar__scenario-surface {
  gap: 4px;
  min-height: 76px;
  padding: 13px 14px;
  border-radius: var(--varo-ui-radius);
}

.preview-toolbar__scenario-surface strong {
  font-size: 14px;
  color: var(--varo-ui-text);
}

.preview-toolbar__scenario-surface > span {
  font-size: 12px;
  line-height: 1.45;
}

.preview-toolbar__control:checked + .preview-toolbar__scenario-surface,
.preview-toolbar__control:checked + .preview-toolbar__width-surface {
  color: var(--varo-ui-primary-text);
  background: var(--varo-ui-primary-soft);
  border-color: var(--varo-ui-primary);
}

.preview-toolbar__control:checked + .preview-toolbar__scenario-surface strong,
.preview-toolbar__control:checked + .preview-toolbar__width-surface strong {
  color: var(--varo-ui-primary-text);
}

.preview-toolbar__control:focus-visible + .preview-toolbar__scenario-surface,
.preview-toolbar__control:focus-visible + .preview-toolbar__width-surface {
  outline: 2px solid var(--varo-ui-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--varo-ui-ring);
}

@media (hover: hover) {
  .preview-toolbar__scenario:hover .preview-toolbar__scenario-surface,
  .preview-toolbar__width:hover .preview-toolbar__width-surface {
    border-color: var(--varo-ui-border-strong);
  }

  .preview-toolbar__scenario:hover .preview-toolbar__control:checked + .preview-toolbar__scenario-surface,
  .preview-toolbar__width:hover .preview-toolbar__control:checked + .preview-toolbar__width-surface {
    border-color: var(--varo-ui-primary-dark);
  }
}

.preview-toolbar__width-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.preview-toolbar__width-surface {
  gap: 3px;
  min-height: 61px;
  padding: 10px 6px;
  text-align: center;
  border-radius: var(--varo-ui-radius-sm);
}

.preview-toolbar__width-surface strong {
  font-size: 12px;
  color: var(--varo-ui-text);
}

.preview-toolbar__width-surface span {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.preview-toolbar__reset {
  display: grid;
  gap: 8px;
  padding-top: 18px;
  border-top: 1px solid var(--varo-ui-border-light);
}

.preview-toolbar__reset p {
  margin: 0;
}
</style>
