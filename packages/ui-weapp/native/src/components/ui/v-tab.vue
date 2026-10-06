<script setup lang="ts">
import type { TabName, VaroTabsContext } from './tabs-context'
import { computed, inject, onBeforeUnmount, watch } from 'wevu'
import { getTabsPanelId, getTabsTriggerId, tabsContextKey } from './tabs-context'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    name: TabName
    title?: string
  }>(),
  {
    disabled: false,
    title: '',
  },
)

const context = inject<VaroTabsContext>(tabsContextKey)
if (!context) {
  throw new Error('VTab must be used inside VTabs')
}
const tabs = context

function register() {
  tabs.registerTab({
    disabled: props.disabled,
    name: props.name,
    title: props.title || String(props.name),
  })
}

register()
watch(
  () => [props.name, props.title, props.disabled] as const,
  ([name], [previousName]) => {
    if (name !== previousName) { tabs.unregisterTab(previousName) }
    register()
  },
)
onBeforeUnmount(() => tabs.unregisterTab(props.name))

const active = computed(() => tabs.active.value === props.name)
const activeData = computed(() => String(active.value))
const panelId = computed(() => getTabsPanelId(tabs.rootId, props.name))
const triggerId = computed(() => getTabsTriggerId(tabs.rootId, props.name))
</script>

<template>
  <view
    v-if="active"
    :id="panelId"
    class="varo-tabs__panel"
    role="tabpanel"
    tabindex="0"
    :aria-labelledby="triggerId"
    :data-active="activeData"
  >
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
