<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { MenuContext, MenuName } from './menu-context'
import { computed, provide, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
import { menuContextKey } from './menu-context'

const props = withDefaults(
  defineProps<{
    activeName?: MenuName
    className?: ClassValue
    defaultActiveName?: MenuName
  }>(),
  {
    activeName: undefined,
    defaultActiveName: undefined,
  },
)

const emit = defineEmits<{
  close: [name?: MenuName]
  open: [name: MenuName]
  'update:activeName': [name: MenuName | undefined]
}>()

const localActive = shallowRef<MenuName | undefined>(props.defaultActiveName)
const current = computed(() => props.activeName ?? localActive.value)
const classes = computed(() => cn('varo-menu', props.className))
const activeNameData = computed(() => current.value === undefined ? undefined : String(current.value))

function setActive(name: MenuName | undefined) {
  if (props.activeName === undefined || name === undefined) {
    localActive.value = name
  }
  emit('update:activeName', name)
}

provide<MenuContext>(menuContextKey, {
  activeName: current,
  toggle(name) {
    const next = current.value === name ? undefined : name
    setActive(next)
    if (next === undefined) {
      emit('close', name)
      return
    }
    emit('open', name)
  },
  close() {
    setActive(undefined)
    emit('close')
  },
})
</script>

<template>
  <view :class="classes" :data-active-name="activeNameData">
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
