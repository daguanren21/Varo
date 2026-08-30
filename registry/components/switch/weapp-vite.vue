<script setup lang="ts">
import { useSwitchRoot } from '@varo-ui/headless'
import { computed, toRef } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    modelValue?: boolean
  }>(),
  {
    disabled: false,
    loading: false,
    modelValue: false,
  },
)

const emit = defineEmits<{
  'change': [value: boolean]
  'update:modelValue': [value: boolean]
}>()
const controlled = computed(() => true)
const switchRoot = useSwitchRoot({
  runtime: varoReactiveRuntime,
  checked: toRef(props, 'modelValue'),
  checkedControlled: controlled,
  disabled: toRef(props, 'disabled'),
  loading: toRef(props, 'loading'),
  onCheckedChange: update,
})
const checked = computed(() => switchRoot.state.checked.value)
const interactive = computed(() => switchRoot.state.interactive.value)
const loading = computed(() => switchRoot.state.loading.value)
const thumbState = computed(() => switchRoot.state.checked.value ? 'checked' : 'unchecked')

function update(value: boolean) {
  emit('update:modelValue', value)
  emit('change', value)
}

function toggle() {
  switchRoot.events.toggle()
}
</script>

<template>
  <button
    class="varo-switch"
    type="button"
    role="switch"
    :disabled="!interactive"
    :aria-checked="checked"
    :data-checked="String(checked)"
    :data-loading="String(loading)"
    @click="toggle"
  >
    <view class="varo-switch__track">
      <view class="varo-switch__thumb" :data-state="thumbState" />
    </view>
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
