<script setup lang="ts">
import { provide } from 'wevu'

const props = defineProps<{ value: string }>()
const context = { value: props.value, action: () => props.value }
provide('varo-consumer-slot-owner', context)
defineExpose({ context })
</script>

<template>
  <view><slot /></view>
</template>
