<script setup lang="ts">
import type { ITabList } from '@/typings'
import { computed, shallowRef, watch } from 'wevu'

const props = withDefaults(defineProps<{
  default?: string
  tabList?: ITabList[]
}>(), {
  default: 'deviceMap',
  tabList: () => [
    { key: 'deviceMap', text: 'AED分布', isActive: true },
    { key: 'deviceList', text: 'AED列表', isActive: false },
  ],
})

const emit = defineEmits<{
  change: [key: string]
}>()
const currentKey = shallowRef(props.default)
const tabList = computed<ITabList[]>(() =>
  props.tabList.map((item): ITabList => ({
    ...item,
    isActive: item.key === currentKey.value,
  })),
)

watch(() => props.default, (value) => {
  currentKey.value = value
})

function changeTab(item: ITabList) {
  currentKey.value = item.key
  emit('change', item.key)
}
</script>

<template>
  <view class="tabBar">
    <view
      v-for="item in tabList"
      :key="item.key"
      class="tab"
      :class="{ active: item.isActive }"
      @tap="changeTab(item)"
    >
      {{ item.text }}
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
