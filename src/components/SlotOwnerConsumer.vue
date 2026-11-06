<script setup lang="ts">
import { inject } from 'wevu'
const ownership = inject('slot-owner-context', 'missing')
defineExpose({ ownership })
</script>
<template><view>{{ ownership }}</view></template>
