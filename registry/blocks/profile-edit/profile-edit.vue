<script setup lang="ts">
import { shallowRef } from 'vue'
import { VSelect } from '../ui/select'

const city = shallowRef<string | number>()
const cities = [
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' },
  { label: '深圳', value: 'shenzhen' }
]
</script>

<template>
  <section class="varo-block varo-profile-edit">
    <label class="varo-profile-edit__field">
      <span>所在城市</span>
      <VSelect v-model="city" :options="cities" placeholder="请选择城市" />
    </label>
  </section>
</template>
