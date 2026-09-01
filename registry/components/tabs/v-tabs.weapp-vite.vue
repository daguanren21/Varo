<script setup lang="ts">
import type { TabName, TabRegistration, VaroTabsContext } from './tabs-context'
import { computed, provide, shallowRef } from 'wevu'
import {
  createTabsRootId,
  getTabsPanelId,
  getTabsTriggerId,
  tabsContextKey,
} from './tabs-context'

type TabsType = 'line' | 'card'
interface KeyboardLikeEvent {
  detail?: { key?: string }
  key?: string
  preventDefault?: () => void
}

const props = withDefaults(
  defineProps<{
    active?: TabName
    ariaLabel?: string
    id?: string
    type?: TabsType
  }>(),
  {
    active: undefined,
    ariaLabel: undefined,
    id: undefined,
    type: 'line',
  },
)

const emit = defineEmits<{
  'change': [name: TabName]
  'clickTab': [payload: { name: TabName, title: string }]
  'update:active': [name: TabName]
}>()

const rootId = props.id || createTabsRootId()
const active = computed(() => props.active)
const registrations = shallowRef<TabRegistration[]>([])
const focusedName = shallowRef<TabName>()
const activeData = computed(() => String(props.active ?? ''))

function registerTab(tab: TabRegistration) {
  const index = registrations.value.findIndex(item => item.name === tab.name)
  if (index < 0) {
    registrations.value = [...registrations.value, tab]
    return
  }
  registrations.value = registrations.value.map((item, itemIndex) => itemIndex === index ? tab : item)
}

function unregisterTab(name: TabName) {
  registrations.value = registrations.value.filter(item => item.name !== name)
}

provide<VaroTabsContext>(tabsContextKey, {
  active,
  registerTab,
  rootId,
  unregisterTab,
})

const renderedTabs = computed(() => {
  const activeTab = registrations.value.find(tab => tab.name === props.active && !tab.disabled)
  const fallbackTab = registrations.value.find(tab => !tab.disabled)
  const focusName = focusedName.value ?? activeTab?.name ?? fallbackTab?.name

  return registrations.value.map(tab => ({
    ...tab,
    active: tab.name === props.active,
    ariaDisabled: tab.disabled ? 'true' : undefined,
    ariaSelected: String(tab.name === props.active),
    dataActive: String(tab.name === props.active),
    dataDisabled: String(tab.disabled),
    focus: tab.name === focusName,
    panelId: getTabsPanelId(rootId, tab.name),
    tabindex: tab.name === focusName && !tab.disabled ? 0 : -1,
    triggerId: getTabsTriggerId(rootId, tab.name),
  }))
})

function select(tab: TabRegistration) {
  if (tab.disabled) { return }
  focusedName.value = tab.name
  emit('update:active', tab.name)
  emit('change', tab.name)
  emit('clickTab', { name: tab.name, title: tab.title })
}

function getKeyboardTarget(key: string, currentIndex: number) {
  const enabledIndices = registrations.value.flatMap((tab, index) => tab.disabled ? [] : [index])
  if (enabledIndices.length === 0) { return undefined }
  if (key === 'Home') { return enabledIndices[0] }
  if (key === 'End') { return enabledIndices.at(-1) }
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') { return undefined }

  const currentEnabledIndex = enabledIndices.indexOf(currentIndex)
  const offset = key === 'ArrowRight' ? 1 : -1
  return enabledIndices[(currentEnabledIndex + offset + enabledIndices.length) % enabledIndices.length]
}

function handleKeydown(event: KeyboardLikeEvent, index: number) {
  const key = event.key ?? event.detail?.key ?? ''
  const targetIndex = getKeyboardTarget(key, index)
  if (targetIndex === undefined) { return }
  event.preventDefault?.()

  const target = registrations.value[targetIndex]
  if (target) { select(target) }
}
</script>

<template>
  <view
    :id="rootId"
    class="varo-tabs"
    :data-active="activeData"
    :data-type="props.type"
    data-orientation="horizontal"
  >
    <view
      class="varo-tabs__nav"
      role="tablist"
      :aria-label="props.ariaLabel"
      aria-orientation="horizontal"
    >
      <button
        v-for="(tab, index) in renderedTabs"
        :id="tab.triggerId"
        :key="tab.name"
        class="varo-tabs__tab"
        role="tab"
        :aria-controls="tab.panelId"
        :aria-disabled="tab.ariaDisabled"
        :aria-selected="tab.ariaSelected"
        :data-active="tab.dataActive"
        :data-disabled="tab.dataDisabled"
        :disabled="tab.disabled"
        :focus="tab.focus"
        :tabindex="tab.tabindex"
        @click="select(tab)"
        @keydown="handleKeydown($event, index)"
      >
        {{ tab.title }}
      </button>
    </view>
    <view class="varo-tabs__content">
      <slot />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
