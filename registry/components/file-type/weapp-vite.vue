<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { FileTypeSize } from './file-type-utils'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { classifyFileType } from './file-type-utils'
import VIcon from './v-icon.vue'

defineOptions({
  properties: {
    filename: { type: null, value: '' },
    label: { type: null, value: '' },
    mimeType: { type: null, value: '' },
  },
})

const props = withDefaults(defineProps<{
  className?: ClassValue
  decorative?: boolean
  filename?: string
  label?: string
  mimeType?: string
  size?: FileTypeSize
}>(), {
  decorative: false,
  filename: '',
  label: '',
  mimeType: '',
  size: 'md',
})

const fileType = computed(() => classifyFileType(props.filename || '', props.mimeType || ''))
const classes = computed(() => cn('varo-file-type', props.className))
const iconSize = computed(() => props.size === 'sm' ? 12 : props.size === 'lg' ? 20 : 16)
const accessibleLabel = computed(() => props.decorative ? undefined : props.label || `${fileType.value.description} (${fileType.value.label})`)
const iconRole = computed(() => props.decorative ? undefined : 'img')
const ariaHidden = computed(() => props.decorative ? 'true' : undefined)
</script>

<template>
  <view
    :class="classes"
    :data-family="fileType.family"
    :data-size="size"
    :role="iconRole"
    :aria-hidden="ariaHidden"
    :aria-label="accessibleLabel"
  >
    <VIcon name="file-type" :size="iconSize">
      <view class="varo-file-type__glyph" aria-hidden="true" />
    </VIcon>
    <text class="varo-file-type__label" aria-hidden="true">
      {{ fileType.label }}
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
