<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type PaginationMode = 'multi' | 'simple'

interface RenderedPage {
  activeData: string
  ariaCurrent: 'page' | undefined
  ariaLabel: string
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    className?: ClassValue
    itemAriaLabel?: string
    mode?: PaginationMode
    modelValue?: number
    nextText?: string
    pageCount?: number
    prevText?: string
  }>(),
  {
    ariaLabel: '分页',
    className: undefined,
    itemAriaLabel: '第 {page} 页，共 {total} 页',
    mode: 'multi',
    modelValue: 1,
    nextText: '下一页',
    pageCount: 1,
    prevText: '上一页',
  },
)

const emit = defineEmits<{
  change: [page: number]
  'update:modelValue': [page: number]
}>()

function itemLabel(page: number) {
  return props.itemAriaLabel
    .replaceAll('{page}', String(page))
    .replaceAll('{total}', String(props.pageCount))
}

const classes = computed(() => cn('varo-pagination', props.className))
const isSimple = computed(() => props.mode === 'simple')
const nextDisabled = computed(() => props.modelValue >= props.pageCount)
const pages = computed<RenderedPage[]>(() =>
  Array.from({ length: Math.max(props.pageCount, 0) }, (_, index) => {
    const value = index + 1
    const active = value === props.modelValue
    return {
      activeData: String(active),
      ariaCurrent: active ? 'page' : undefined,
      ariaLabel: itemLabel(value),
      label: String(value),
      value,
    }
  }),
)
const previousDisabled = computed(() => props.modelValue <= 1)
const simpleText = computed(() => `${props.modelValue}/${props.pageCount}`)

function setPage(page: number) {
  const next = Math.min(Math.max(page, 1), props.pageCount)
  if (next === props.modelValue) { return }

  emit('update:modelValue', next)
  emit('change', next)
}

function previous() {
  setPage(props.modelValue - 1)
}

function next() {
  setPage(props.modelValue + 1)
}
</script>

<template>
  <view
    :class="classes"
    role="navigation"
    :aria-label="props.ariaLabel"
    :data-mode="props.mode"
  >
    <button
      class="varo-pagination__prev"
      type="button"
      :disabled="previousDisabled"
      @click="previous"
    >
      {{ props.prevText }}
    </button>
    <text v-if="isSimple" class="varo-pagination__simple">
      {{ simpleText }}
    </text>
    <template v-else>
      <button
        v-for="page in pages"
        :key="page.value"
        class="varo-pagination__page"
        type="button"
        :aria-current="page.ariaCurrent"
        :aria-label="page.ariaLabel"
        :data-active="page.activeData"
        @click="setPage(page.value)"
      >
        {{ page.label }}
      </button>
    </template>
    <button
      class="varo-pagination__next"
      type="button"
      :disabled="nextDisabled"
      @click="next"
    >
      {{ props.nextText }}
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
