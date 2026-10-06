<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { TabbarName } from './tabbar-context'
import { computed, provide } from 'wevu'
import { cn } from '../../lib/cn'
import { tabbarContextKey } from './tabbar-context'

const props = withDefaults(
  defineProps<{
    border?: boolean
    className?: ClassValue
    fixed?: boolean
    modelValue?: TabbarName
    safeAreaInsetBottom?: boolean
  }>(),
  {
    border: true,
    className: undefined,
    fixed: false,
    modelValue: undefined,
    safeAreaInsetBottom: false,
  },
)

const emit = defineEmits<{
  change: [name: TabbarName]
  'update:modelValue': [name: TabbarName]
}>()

const borderData = computed(() => String(props.border))
const classes = computed(() => cn('varo-tabbar', props.className))
const current = computed(() => props.modelValue)
const fixedData = computed(() => String(props.fixed))
const safeAreaInsetBottomData = computed(() => String(props.safeAreaInsetBottom))

function select(name: TabbarName) {
  emit('update:modelValue', name)
  emit('change', name)
}

provide(tabbarContextKey, {
  current,
  select,
})
</script>

<template>
  <view
    :class="classes"
    role="navigation"
    :data-border="borderData"
    :data-fixed="fixedData"
    :data-safe-area-inset-bottom="safeAreaInsetBottomData"
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
