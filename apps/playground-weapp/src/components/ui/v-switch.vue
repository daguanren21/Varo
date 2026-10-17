<script setup lang="ts">
import { useSwitchRoot } from '@varo-ui/headless'
import { computed, toRef } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    disabled?: boolean
    loading?: boolean
    modelValue?: boolean
    readonly?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    ariaLabel: 'Switch',
    disabled: false,
    loading: false,
    modelValue: false,
    readonly: false,
    size: 'md',
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
  readonly: toRef(props, 'readonly'),
  onCheckedChange: update,
})
const checked = computed(() => switchRoot.state.checked.value)
const interactive = computed(() => switchRoot.state.interactive.value)
const loading = computed(() => switchRoot.state.loading.value)
const readonly = computed(() => switchRoot.state.readonly.value)
const thumbState = computed(() => switchRoot.state.checked.value ? 'checked' : 'unchecked')
const interactiveAttribute = computed(() => String(interactive.value))

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
    :aria-label="props.ariaLabel"
    hover-class="varo-switch--pressed"
    :hover-start-time="20"
    :hover-stay-time="70"
    type="button"
    role="switch"
    :disabled="props.disabled || loading"
    :aria-checked="checked"
    :aria-disabled="props.disabled || loading"
    :aria-readonly="readonly"
    :aria-busy="loading"
    :data-size="props.size"
    :data-state="thumbState"
    :data-loading="String(loading)"
    :data-readonly="String(readonly)"
    :data-interactive="interactiveAttribute"
    @click="toggle"
  >
    <view class="varo-switch__track">
      <view class="varo-switch__thumb" :data-state="thumbState">
        <view v-if="loading" class="varo-switch__spinner" aria-hidden="true" />
      </view>
    </view>
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
