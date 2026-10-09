<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import catalog from '../registry-catalog.json'

const props = withDefaults(defineProps<{ component: string, locale?: 'zh' | 'en' }>(), { locale: 'zh' })
const sources = import.meta.glob<string>('../../../../registry/components/**/*.vue', { query: '?raw', import: 'default' })
const componentNames: Record<string, string> = { 'number-field': 'input-number', 'radio-group': 'radio', 'collapsible': 'collapse', 'accordion': 'collapse', 'form-array': 'form', 'calendar-card': 'calendar' }
const ids = computed(() => props.component === 'overview' ? ['button', 'input', 'dialog'] : [componentNames[props.component] ?? props.component])
const entries = computed(() => ids.value.map(id => catalog.components[id as keyof typeof catalog.components]).filter(item => item?.targets.includes('weapp')))
const files = computed(() => entries.value.flatMap(item => item.nativeFiles))
const loaded = shallowRef<Array<{ path: string, content: string }>>([])
const loading = shallowRef(false)
const error = shallowRef('')
const command = computed(() => `pnpm dlx @varo-ui/cli add ${ids.value.join(' ')} --target weapp`)

watch(files, async (next, _previous, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  loaded.value = []
  error.value = ''
  loading.value = next.length > 0
  try {
    const result = await Promise.all(next.map(async (file) => {
      const load = sources[`../../../../${file.from}`]
      if (!load) { throw new Error(`Missing authored source: ${file.from}`) }
      return { path: file.to, content: await load() }
    }))
    if (current) { loaded.value = result }
  }
  catch (cause) {
    if (current) { error.value = cause instanceof Error ? cause.message : String(cause) }
  }
  finally {
    if (current) { loading.value = false }
  }
}, { immediate: true })
</script>

<template>
  <section class="native-source-preview" data-evidence="source">
    <h3>{{ locale === 'en' ? 'Native Wevu source' : '原生 Wevu 源码' }}</h3>
    <p role="note">
      {{ locale === 'en'
        ? 'These are the actual Registry SFCs, not a Vue browser emulation. Compilation, browser artifact preview, and native device verification are separate evidence levels.'
        : '这里展示实际安装的 Registry SFC，不用 Vue 浏览器组件模拟小程序。编译通过、浏览器产物预览与真机验证是不同层级的证据。' }}
    </p>
    <p v-if="!files.length">
      {{ locale === 'en' ? 'This component does not declare a native Registry implementation.' : '该组件未声明原生 Registry 实现。' }}
    </p>
    <template v-else>
      <pre><code>{{ command }}</code></pre>
      <p v-if="loading" role="status">
        {{ locale === 'en' ? 'Loading source…' : '正在加载源码…' }}
      </p>
      <p v-if="error" role="alert">
        {{ error }}
      </p>
      <details v-for="file in loaded" :key="file.path">
        <summary><code>{{ file.path }}</code></summary>
        <pre><code>{{ file.content }}</code></pre>
      </details>
    </template>
  </section>
</template>

<style scoped>
.native-source-preview {
  min-width: 0;
  padding: 20px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.native-source-preview h3 {
  margin-top: 0;
}

.native-source-preview pre {
  max-width: 100%;
  padding: 12px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.6;
}

.native-source-preview details {
  margin-top: 12px;
}

.native-source-preview summary {
  overflow-wrap: anywhere;
  cursor: pointer;
}

.native-source-preview summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
</style>
