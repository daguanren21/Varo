<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { MenuContext, MenuName } from './menu-context'
import { computed, inject } from 'wevu'
import { cn } from '../../lib/cn'
import { createMenuPopupId, menuContextKey } from './menu-context'
import VIcon from './v-icon.vue'

interface MenuOption {
  text: string
  value: MenuName
  disabled?: boolean
  icon?: string
}

interface KeyboardLikeEvent {
  detail?: { key?: string }
  key?: string
  preventDefault?: () => void
}

interface RenderedMenuOption {
  active: boolean
  dataActive: string
  option: MenuOption
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    modelValue?: MenuName
    name: MenuName
    options?: MenuOption[]
    title?: string
  }>(),
  {
    modelValue: undefined,
    options: () => [],
    title: undefined,
  },
)

const emit = defineEmits<{
  select: [value: MenuName, option: MenuOption]
  'update:modelValue': [value: MenuName]
}>()

const menu = inject<MenuContext>(menuContextKey)
const open = computed(() => Boolean(menu && menu.activeName.value === props.name))
const classes = computed(() => cn('varo-menu__item', props.className))
const openData = computed(() => String(open.value))
const popupId = createMenuPopupId()
const renderedOptions = computed<RenderedMenuOption[]>(() =>
  props.options.map(option => {
    const active = props.modelValue === option.value
    return {
      active,
      dataActive: String(active),
      option,
    }
  }),
)

function toggle() {
  if (menu) { menu.toggle(props.name) }
}

function select(option: MenuOption) {
  if (option.disabled) { return }
  emit('update:modelValue', option.value)
  emit('select', option.value, option)
  if (menu) { menu.close() }
}

function keydown(event: unknown) {
  const keyboardEvent = event as KeyboardLikeEvent
  const detailKey = keyboardEvent.detail ? keyboardEvent.detail.key : undefined
  const key = keyboardEvent.key || detailKey || ''
  if (!open.value || key !== 'Escape') { return }
  if (keyboardEvent.preventDefault) { keyboardEvent.preventDefault() }
  if (menu) { menu.close() }
}
</script>

<template>
  <view :class="classes" :data-open="openData" @keydown="keydown">
    <button
      class="varo-menu__title"
      :aria-expanded="open"
      :aria-controls="popupId"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <text class="varo-menu__title-text">
        <slot name="title">{{ props.title }}</slot>
      </text>
      <text class="varo-menu__arrow" aria-hidden="true" />
    </button>
    <view v-if="open" :id="popupId" class="varo-menu__popup" role="listbox">
      <slot>
        <button
          v-for="renderedOption in renderedOptions"
          :key="renderedOption.option.value"
          class="varo-menu__option"
          :disabled="renderedOption.option.disabled"
          :data-active="renderedOption.dataActive"
          :aria-selected="renderedOption.active"
          role="option"
          @click="select(renderedOption.option)"
        >
          <VIcon
            v-if="renderedOption.option.icon"
            :name="renderedOption.option.icon"
            :size="16"
            class-name="varo-menu__option-icon"
          />
          <text class="varo-menu__option-text">{{ renderedOption.option.text }}</text>
          <VIcon
            v-if="renderedOption.active"
            name="success"
            :size="16"
            class-name="varo-menu__check"
          />
        </button>
      </slot>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
