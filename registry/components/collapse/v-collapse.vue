<script setup lang="ts">
import type { AccordionType, AccordionValue } from '@varo-ui/headless'
import type { ClassValue } from '../../lib/cn'
import type { CollapseContext } from './collapse-context'
import { useAccordionRoot } from '@varo-ui/headless'
import { computed, provide } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { collapseContextKey } from './collapse-context'

const props = withDefaults(
  defineProps<{
    accordion?: boolean
    className?: ClassValue
    collapsible?: boolean
    defaultValue?: AccordionValue
    disabled?: boolean
    value?: AccordionValue
  }>(),
  {
    accordion: false,
    collapsible: true,
    defaultValue: undefined,
    disabled: false,
    value: undefined,
  },
)

const emit = defineEmits<{
  change: [value: AccordionValue]
  'update:value': [value: AccordionValue]
}>()

const type = computed<AccordionType>(() => props.accordion ? 'single' : 'multiple')
const collapsible = computed(() => props.collapsible)
const disabled = computed(() => props.disabled)
const value = computed<AccordionValue>(() => props.value)
const valueControlled = computed(() => props.value !== undefined)
const collapse = useAccordionRoot({
  runtime: varoReactiveRuntime,
  collapsible,
  defaultValue: props.defaultValue,
  disabled,
  type,
  value,
  valueControlled,
  onValueChange(nextValue) {
    emit('update:value', nextValue)
    emit('change', nextValue)
  },
})

provide<CollapseContext>(collapseContextKey, collapse)

const classes = computed(() => cn('varo-collapse', props.className))
const rootId = String(collapse.attrs.root.id)
const dataDisabled = computed(() => String(collapse.state.disabled.value))
const dataType = computed(() => collapse.state.type.value)
</script>

<template>
  <view
    :id="rootId"
    :class="classes"
    :data-disabled="dataDisabled"
    :data-type="dataType"
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
