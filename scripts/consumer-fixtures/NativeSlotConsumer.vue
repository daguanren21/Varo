<script setup lang="ts">
import { inject } from 'wevu'

const ownership = inject('varo-consumer-slot-owner', 'missing')
defineExpose({ ownership })
</script>

<template>
  <view>{{ ownership }}</view>
</template>
