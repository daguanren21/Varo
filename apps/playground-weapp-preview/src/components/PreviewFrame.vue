<script setup lang="ts">
import type { PreviewScenarioId } from '../protocol'
import { VButton } from '@varo-ui/h5'
import { computed, onBeforeMount, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { isPreviewFrameMessage, previewScenarios } from '../protocol'

type PreviewState = 'loading' | 'ready' | 'error'
type PreviewWidth = 320 | 390 | 430

interface Props {
  scenario: PreviewScenarioId
  session: string
  width: PreviewWidth
}

interface Emits {
  reset: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const runtimeFrame = useTemplateRef<HTMLIFrameElement>('runtimeFrame')
const frameStage = useTemplateRef<HTMLDivElement>('frameStage')
const frameDevice = useTemplateRef<HTMLDivElement>('frameDevice')
const availableWidth = shallowRef(0)
const deviceHeight = shallowRef(0)
let resizeObserver: ResizeObserver | undefined
const state = shallowRef<PreviewState>('loading')
const artifact = shallowRef('')
const errorMessage = shallowRef('')

const scenarioDetails = computed(() =>
  previewScenarios.find(item => item.id === props.scenario) ?? previewScenarios[0],
)
const frameUrl = computed(
  () => `./runtime.html?scenario=${props.scenario}&session=${encodeURIComponent(props.session)}`,
)
const scale = computed(() => availableWidth.value > 0 ? Math.min(1, availableWidth.value / (props.width + 2)) : 1)
const frameStyle = computed(() => ({ inlineSize: `${props.width}px`, transform: `scale(${scale.value})` }))
const fitStyle = computed(() => ({ inlineSize: `${(props.width + 2) * scale.value}px`, blockSize: `${deviceHeight.value * scale.value}px` }))
const scaleLabel = computed(() => `${Math.round(scale.value * 100)}%`)
const frameTitle = computed(() => `${scenarioDetails.value.title} Wevu Web 兼容预览`)
const stateLabel = computed(() => {
  if (state.value === 'ready') {
    return '已就绪'
  }

  if (state.value === 'error') {
    return '载入失败'
  }

  return '正在加载'
})

watch(
  [() => props.session, () => props.scenario],
  () => {
    state.value = 'loading'
    artifact.value = ''
    errorMessage.value = ''
  },
  { immediate: true },
)

function receiveFrameMessage(event: MessageEvent<unknown>) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.source !== runtimeFrame.value?.contentWindow) {
    return
  }

  if (!isPreviewFrameMessage(event.data)) {
    return
  }

  if (event.data.session !== props.session || event.data.scenario !== props.scenario) {
    return
  }

  if (event.data.type === 'ready') {
    artifact.value = event.data.artifact
    errorMessage.value = ''
    state.value = 'ready'
    return
  }

  artifact.value = ''
  errorMessage.value = event.data.message
  state.value = 'error'
}

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === frameStage.value) { availableWidth.value = entry.contentRect.width }
      if (entry.target === frameDevice.value) { deviceHeight.value = entry.contentRect.height + 2 }
    }
  })
  if (frameStage.value) { resizeObserver.observe(frameStage.value) }
  if (frameDevice.value) { resizeObserver.observe(frameDevice.value) }
})

onBeforeMount(() => {
  window.addEventListener('message', receiveFrameMessage)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('message', receiveFrameMessage)
})
</script>

<template>
  <article class="preview-frame" :data-state="state">
    <header class="preview-frame__header">
      <div class="preview-frame__route">
        <span>Native page</span>
        <code>{{ scenarioDetails.page }}</code>
      </div>

      <div class="preview-frame__status" :data-state="state">
        <span class="preview-frame__status-dot" aria-hidden="true" />
        <span>{{ stateLabel }}</span>
      </div>
    </header>

    <div ref="frameStage" class="preview-frame__stage">
      <div class="preview-frame__fit" :style="fitStyle">
        <div ref="frameDevice" class="preview-frame__device" :style="frameStyle">
          <div class="preview-frame__device-bar" aria-hidden="true">
            <span>{{ scenarioDetails.title }}</span>
            <span>{{ props.width }} px · {{ scaleLabel }}</span>
          </div>

          <div class="preview-frame__canvas" :aria-busy="state === 'loading'">
            <iframe
              :key="props.session"
              ref="runtimeFrame"
              class="preview-frame__iframe"
              :src="frameUrl"
              :title="frameTitle"
              :tabindex="state === 'ready' ? 0 : -1"
              :aria-hidden="state !== 'ready'"
            />

            <div v-if="state === 'loading'" class="preview-frame__overlay" role="status" aria-live="polite">
              <span class="preview-frame__state-mark" aria-hidden="true" />
              <strong>正在启动 Web 兼容运行时</strong>
              <p>等待 glass-easel 装载当前 Wevu 原生构建产物。</p>
            </div>

            <div v-else-if="state === 'error'" class="preview-frame__overlay" role="alert">
              <span class="preview-frame__state-mark" aria-hidden="true" />
              <strong>预览无法启动</strong>
              <p>{{ errorMessage }}</p>
              <VButton native-type="button" tone="danger" @click="emit('reset')">
                重置并重试
              </VButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="preview-frame__artifact" aria-live="polite">
      <span>运行产物</span>
      <output v-if="state === 'ready'">{{ artifact }}</output>
      <p v-else-if="state === 'error'">
        未载入产物；可使用上方操作重置。
      </p>
      <p v-else>
        等待运行时报告产物标识。
      </p>
    </footer>
  </article>
</template>

<style scoped>
.preview-frame {
  min-width: 0;
  overflow: hidden;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border);
  border-radius: calc(var(--varo-ui-radius) + 8px);
  box-shadow: var(--varo-ui-shadow-md);
}

.preview-frame__header,
.preview-frame__artifact {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 14px 16px;
  background: var(--varo-ui-surface);
}

.preview-frame__header {
  border-bottom: 1px solid var(--varo-ui-border-light);
}

.preview-frame__route {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.preview-frame__route > span,
.preview-frame__artifact > span {
  font-size: 10px;
  font-weight: 800;
  color: var(--varo-ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.preview-frame__route code,
.preview-frame__artifact output,
.preview-frame__artifact p {
  min-width: 0;
  margin: 0;
  font-size: 12px;
  font-weight: 650;
  color: var(--varo-ui-text-regular);
  overflow-wrap: anywhere;
}

.preview-frame__status {
  display: inline-flex;
  flex: none;
  gap: 7px;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 750;
  color: var(--varo-ui-info-text);
  background: var(--varo-ui-info-soft);
  border-radius: 999px;
}

.preview-frame__status[data-state='ready'] {
  color: var(--varo-ui-success-text);
  background: var(--varo-ui-success-soft);
}

.preview-frame__status[data-state='error'] {
  color: var(--varo-ui-danger-text);
  background: var(--varo-ui-danger-soft);
}

.preview-frame__status-dot {
  width: 8px;
  height: 8px;
  background: currentcolor;
  border-radius: 999px;
}

.preview-frame__stage {
  display: flex;
  min-width: 0;
  padding: 22px;
  overflow: hidden;
  background: var(--varo-ui-bg);
}

.preview-frame__fit {
  position: relative;
  flex: none;
  margin: 0 auto;
}

.preview-frame__device {
  position: absolute;
  inset: 0 auto auto 0;
  box-sizing: content-box;
  max-width: none;
  overflow: hidden;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border-strong);
  border-radius: calc(var(--varo-ui-radius) + 12px);
  box-shadow: var(--varo-ui-shadow-sm);
  transform-origin: top left;
}

.preview-frame__device-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 14px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-ui-text-regular);
  background: var(--varo-ui-surface-muted);
  border-bottom: 1px solid var(--varo-ui-border-light);
}

.preview-frame__device-bar span:last-child {
  font-variant-numeric: tabular-nums;
  color: var(--varo-ui-text-muted);
}

.preview-frame__canvas {
  position: relative;
  height: clamp(568px, 72dvh, 760px);
  min-height: 0;
  overflow: hidden;
  background: var(--varo-ui-surface);
}

.preview-frame__iframe {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--varo-ui-surface);
  border: 0;
}

.preview-frame__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  gap: 10px;
  place-content: center;
  justify-items: center;
  padding: 28px;
  color: var(--varo-ui-text-regular);
  text-align: center;
  background: var(--varo-ui-surface);
}

.preview-frame__overlay strong {
  font-size: 17px;
  color: var(--varo-ui-text);
}

.preview-frame__overlay p {
  max-width: 30ch;
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.preview-frame__state-mark {
  width: 28px;
  height: 6px;
  background: var(--varo-ui-info);
  border-radius: 999px;
}

.preview-frame[data-state='error'] .preview-frame__state-mark {
  background: var(--varo-ui-danger);
}

.preview-frame__artifact {
  align-items: start;
  border-top: 1px solid var(--varo-ui-border-light);
}

.preview-frame__artifact > span {
  flex: none;
  padding-top: 1px;
}

.preview-frame__artifact output {
  color: var(--varo-ui-success-text);
  text-align: right;
}

.preview-frame__artifact p {
  text-align: right;
}

@media (max-width: 620px) {
  .preview-frame__header,
  .preview-frame__artifact {
    align-items: start;
  }

  .preview-frame__stage {
    justify-content: flex-start;
    padding: 12px;
  }

  .preview-frame__canvas {
    height: 660px;
  }
}
</style>
