<script setup lang="ts">
import type { SubmitPayload as FormSubmitPayload } from '@varo-ui/headless'
import { VAvatar, VBadge, VButton, VEmpty, VForm, VInputNumber, VSelect, VTag } from '@varo-ui/weapp'
import { reactive, shallowRef } from 'wevu'

const model = reactive({ quantity: 1 })
const selected = shallowRef<number | string | (number | string)[] | undefined>('local')
const checked = shallowRef(false)
const submitted = shallowRef('Not submitted')
const options = [{ label: 'Local state only', value: 'local' }, { label: 'No remote service', value: 'offline' }]

function submit(payload: FormSubmitPayload) {
  submitted.value = JSON.stringify({ values: payload.values, errors: payload.errors })
}
</script>

<template>
  <VForm :model="model" @submit="submit">
    <view class="flex flex-col gap-4 p-4">
      <text>Named native package exports</text>
      <VAvatar alt="Consumer" fallback="VC" />
      <VBadge :content="model.quantity" />
      <VInputNumber v-model:value="model.quantity" :min="0" :max="10" input-aria-label="Quantity" />
      <VSelect v-model:value="selected" :options="options" />
      <VTag v-model:checked="checked" checkable label="Selected locally" />
      <VEmpty title="No remote data" description="This consumer makes no product API calls." />
      <VButton native-type="submit">
        Submit package form locally
      </VButton>
      <text>Quantity: {{ model.quantity }}; selection: {{ selected }}; checked: {{ checked }}</text>
      <text>{{ submitted }}</text>
    </view>
  </VForm>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
