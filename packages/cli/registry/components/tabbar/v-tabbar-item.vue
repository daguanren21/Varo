<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { TabbarContext, TabbarName } from './tabbar-context'
import { computed, inject } from 'wevu'
import { cn } from '../../lib/cn'
import { tabbarContextKey } from './tabbar-context'

const props = withDefaults(
  defineProps<{
    badge?: string | number
    className?: ClassValue
    dot?: boolean
    icon?: string
    name: TabbarName
  }>(),
  {
    badge: undefined,
    className: undefined,
    dot: false,
    icon: undefined,
  },
)

const tabbar = inject<TabbarContext>(tabbarContextKey)
const active = computed(() => tabbar?.current.value === props.name)
const activeData = computed(() => String(active.value))
const ariaCurrent = computed<'page' | undefined>(() => (active.value ? 'page' : undefined))
const badgeVisible = computed(() => props.badge !== undefined && props.badge !== null)
const badgeText = computed(() => (badgeVisible.value ? String(props.badge) : ''))
const classes = computed(() => cn('varo-tabbar__item', props.className))

function select() {
  tabbar?.select(props.name)
}
</script>

<template>
  <button
    :class="classes"
    type="button"
    :aria-current="ariaCurrent"
    :data-active="activeData"
    @click="select"
  >
    <view v-if="$slots.icon || props.icon" class="varo-tabbar__icon" aria-hidden="true">
      <slot name="icon">
        {{ props.icon }}
      </slot>
    </view>
    <view class="varo-tabbar__text">
      <slot />
    </view>
    <text v-if="badgeVisible" class="varo-tabbar__badge">
      {{ badgeText }}
    </text>
    <text v-if="props.dot" class="varo-tabbar__dot" aria-hidden="true" />
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
