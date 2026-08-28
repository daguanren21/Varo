<script setup lang="ts">
import { toRefs } from 'wevu'
import { useJxFilter } from '../../hooks'

const props = withDefaults(defineProps<{
  isElectrode?: boolean
  state?: string | null
}>(), {
  isElectrode: false,
  state: '',
})

const { getDotFilter } = useJxFilter()

const { state, isElectrode } = toRefs(props)
</script>

<template>
  <view
    class="jx-status"
    :style="{
      borderColor: getDotFilter(state, isElectrode).dot,
    }"
  >
    <view
      class="dot"
      :style="{
        backgroundColor: getDotFilter(state, isElectrode).dot,
        borderColor: getDotFilter(state, isElectrode).dot,
      }"
    />
    <text class="code">
      {{ getDotFilter(state, isElectrode).state }}
    </text>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
