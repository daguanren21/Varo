<script setup lang="ts">
import { resolveDocsPreview } from '@varo/playground-weapp-preview/docs-scenarios'
import { useData } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'
import NativeSourcePreview from './NativeSourcePreview.vue'

const props = withDefaults(defineProps<{
  component: string
  locale?: 'zh' | 'en'
  preview?: boolean
  surface?: 'component' | 'primitive'
  framed?: boolean
}>(), { locale: 'zh', preview: true, surface: 'component', framed: false })
const { isDark } = useData()
const frame = useTemplateRef<HTMLIFrameElement>('frame')
const session = shallowRef('')
const contentHeight = shallowRef(160)
const scenario = computed(() => resolveDocsPreview(props.component, props.surface))
const scrollsPage = computed(() => props.component === 'sticky')
const frameHeight = computed(() => `${scrollsPage.value ? 577 : contentHeight.value}px`)
const previewUrl = computed(() => {
  const query = new URLSearchParams({
    scenario: scenario.value?.id ?? '',
    docs: '1',
    locale: props.locale,
    theme: isDark.value ? 'dark' : 'light',
    session: session.value,
  })
  return `${import.meta.env.BASE_URL}weapp-preview/index.html?${query}`
})
const title = computed(() => props.locale === 'en' ? `${props.component} mini-program preview` : `${props.component} 小程序预览`)

function receiveHeight(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== frame.value?.contentWindow) { return }
  const data: unknown = event.data
  if (!data || typeof data !== 'object') { return }
  const message = data as Record<string, unknown>
  if (message.channel !== 'varo-weapp-preview' || message.type !== 'height'
    || message.session !== session.value || message.scenario !== scenario.value?.id) { return }
  if (typeof message.height === 'number' && Number.isFinite(message.height) && message.height > 0) {
    contentHeight.value = Math.max(160, Math.ceil(message.height))
  }
}

onMounted(() => {
  window.addEventListener('message', receiveHeight)
  // Code/Preview keeps this component mounted but replaces its iframe.
  watch(
    [() => props.preview, scenario, () => props.locale, isDark, () => props.framed],
    ([preview, activeScenario]) => {
      contentHeight.value = 160
      session.value = preview && activeScenario ? crypto.randomUUID() : ''
    },
    { immediate: true },
  )
})
onBeforeUnmount(() => window.removeEventListener('message', receiveHeight))
</script>

<template>
  <section v-if="preview && scenario" class="native-component-preview" data-evidence="native-browser-artifact" :data-scenario="scenario.id">
    <div v-if="framed" class="native-component-preview__evidence">
      <strong>{{ locale === 'en' ? 'Mini Program Live' : '小程序实时预览' }}</strong>
      <span>{{ locale === 'en' ? 'Interactive browser preview' : '浏览器运行时实时交互' }}</span>
    </div>
    <component :is="framed ? DocsDeviceFrame : 'div'" class="native-component-preview__viewport">
      <iframe v-if="session" :key="session" ref="frame" class="native-component-preview__frame" :src="previewUrl" :title="title" :style="{ height: frameHeight }" />
      <p v-else role="status">
        {{ locale === 'en' ? 'Loading preview…' : '正在加载预览…' }}
      </p>
    </component>
    <details class="native-component-preview__source">
      <summary>{{ locale === 'en' ? 'View code' : '查看代码' }}</summary>
      <NativeSourcePreview :component="component" :locale="locale" />
    </details>
  </section>
  <NativeSourcePreview v-else :component="component" :locale="locale" />
</template>

<style scoped>
.native-component-preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
}

.native-component-preview__evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 12px;
  color: var(--varo-demo-text-muted);
  background: var(--varo-demo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 10px;
}

.native-component-preview__evidence strong {
  font-size: 0.76rem;
  color: var(--varo-primary);
}

.native-component-preview__evidence span {
  font-size: 0.72rem;
  line-height: 1.4;
}

.native-component-preview__viewport {
  min-width: 0;
}

.native-component-preview__frame {
  box-sizing: border-box;
  display: block;
  width: 100%;
  background: transparent;
  border: 0;
}

.native-component-preview__source {
  min-width: 0;
}

.native-component-preview__source summary {
  width: fit-content;
  padding: 8px 12px;
  margin: 0 auto 12px;
  font-size: 13px;
  cursor: pointer;
}

.native-component-preview__source summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
</style>
