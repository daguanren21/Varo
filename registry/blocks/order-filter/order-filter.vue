<script setup lang="ts">
import { shallowRef } from 'vue'
import { VSelect } from '../ui/select'

const statuses = shallowRef<Array<string | number>>([])
const statusOptions = [
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'pending_ship' },
  { label: '已完成', value: 'done' }
]
</script>

<template>
  <section class="varo-block varo-order-filter">
    <VSelect v-model="statuses" multiple searchable :options="statusOptions" placeholder="筛选订单状态" />
  </section>
</template>
