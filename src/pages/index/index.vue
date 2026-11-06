<script setup lang="ts">
import SlotOwnerProvider from '../../components/SlotOwnerProvider.vue'
import SlotOwnerConsumer from '../../components/SlotOwnerConsumer.vue'
definePageMeta({ layout: 'default' })
</script>
<template><SlotOwnerProvider value="nearest"><SlotOwnerConsumer /></SlotOwnerProvider></template>
