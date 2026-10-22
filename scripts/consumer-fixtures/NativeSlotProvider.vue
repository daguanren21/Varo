<script setup lang="ts">
import { provide } from 'wevu'

const props = defineProps<{ value: string }>()
provide('varo-consumer-slot-owner', props.value)
</script>

<template>
  <view><slot /></view>
</template>
