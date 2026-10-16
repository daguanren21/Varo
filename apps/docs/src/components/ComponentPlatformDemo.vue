<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'
import NativeComponentPreview from './NativeComponentPreview.vue'

type Platform = 'h5' | 'weapp'

const props = withDefaults(defineProps<{
  component: string
  locale?: 'zh' | 'en'
}>(), { locale: 'zh' })

const activePlatform = shallowRef<Platform>('h5')
const platforms: Platform[] = ['h5', 'weapp']
const id = useId()
const panelId = `${id}-platform-panel`
const previewLabel = computed(() => props.locale === 'en' ? 'Preview platform' : '预览平台')

function tabId(platform: Platform) {
  return `${id}-platform-tab-${platform}`
}

function handleTabKeydown(event: KeyboardEvent) {
  const currentIndex = platforms.indexOf(activePlatform.value)
  let nextIndex = currentIndex
  if (event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % platforms.length
  }
  else if (event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + platforms.length) % platforms.length
  }
  else if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = platforms.length - 1
  }
  else {
    return
  }

  event.preventDefault()
  activePlatform.value = platforms[nextIndex]!
  const tabs = (event.currentTarget as HTMLElement)
    .closest('[role="tablist"]')
    ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  tabs?.[nextIndex]?.focus()
}
</script>

<template>
  <section class="component-platform-demo" :data-component="component" :data-platform="activePlatform">
    <div class="component-platform-demo__tabs" role="tablist" :aria-label="previewLabel">
      <button
        v-for="platform in platforms"
        :id="tabId(platform)"
        :key="platform"
        type="button"
        role="tab"
        :aria-controls="panelId"
        :aria-selected="activePlatform === platform"
        :data-active="activePlatform === platform"
        :tabindex="activePlatform === platform ? 0 : -1"
        @click="activePlatform = platform"
        @keydown="handleTabKeydown"
      >
        {{ platform === 'h5' ? 'H5' : locale === 'en' ? 'Mini Program' : '小程序' }}
      </button>
    </div>
    <div
      :id="panelId"
      class="component-platform-demo__panel"
      role="tabpanel"
      :aria-labelledby="tabId(activePlatform)"
      tabindex="0"
    >
      <NativeComponentPreview v-if="activePlatform === 'weapp'" :component="component" :locale="locale" />
      <slot v-else />
    </div>
  </section>
</template>

<style scoped>
.component-platform-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
  margin: 20px 0 28px;
}

.component-platform-demo__tabs {
  display: inline-flex;
  gap: 4px;
  justify-self: end;
  max-width: 100%;
  padding: 3px;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

.component-platform-demo__tabs button {
  min-height: 34px;
  padding: 0 13px;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--varo-text-secondary);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;
}

.component-platform-demo__tabs button[data-active='true'] {
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--varo-primary) 26%, transparent);
}

.component-platform-demo__tabs button:focus-visible,
.component-platform-demo__panel:focus-visible {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

.component-platform-demo__panel {
  min-width: 0;
  max-width: 100%;
}
</style>
