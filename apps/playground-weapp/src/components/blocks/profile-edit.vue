<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
import VSelect from '../ui/select.vue'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'

interface ProfileDraft {
  bio: string
  city?: string | number
  name: string
  phone: string
}

interface ProfileCityOption {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    cities?: ProfileCityOption[]
    className?: ClassValue
    initialProfile?: Partial<ProfileDraft>
    loading?: boolean
    title?: string
  }>(),
  {
    cities: () => [],
    initialProfile: () => ({}),
    loading: false,
    title: '编辑个人资料',
  },
)

const emit = defineEmits<{
  cancel: []
  submit: [profile: ProfileDraft]
}>()

const bio = shallowRef(props.initialProfile.bio ?? '')
const city = shallowRef<string | number | undefined>(props.initialProfile.city)
const name = shallowRef(props.initialProfile.name ?? '')
const phone = shallowRef(props.initialProfile.phone ?? '')
const canSubmit = computed(() => name.value.trim().length > 0 && phone.value.trim().length > 0 && !props.loading)
const rootClass = computed(() =>
  cn('w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm', props.className),
)

function formatPhone(value: string) {
  return value.replace(/\D/g, '')
}

function submit() {
  if (!canSubmit.value) { return }
  emit('submit', {
    bio: bio.value.trim(),
    city: city.value,
    name: name.value.trim(),
    phone: phone.value.trim(),
  })
}
</script>

<template>
  <view :class="rootClass" aria-labelledby="profile-edit-title">
    <view class="mb-5 grid gap-1">
      <text class="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
        Profile
      </text>
      <text id="profile-edit-title" class="text-xl font-bold text-slate-950">
        {{ title }}
      </text>
    </view>

    <form class="grid" @submit="submit">
      <view class="pb-6">
        <VInput v-model:value="name" label="姓名" clearable placeholder="请输入姓名" />
      </view>
      <view class="pb-6">
        <VInput
          v-model:value="phone"
          label="手机号"
          type="tel"
          :formatter="formatPhone"
          :max-length="11"
          clearable
          placeholder="请输入手机号"
        />
      </view>
      <view class="grid gap-2 pb-6 text-sm font-semibold text-slate-700">
        <text>所在城市</text>
        <VSelect v-model:value="city" :options="cities" searchable clearable placeholder="请选择城市" />
      </view>
      <view class="pb-6">
        <VInput
          v-model:value="bio"
          label="个人简介"
          type="textarea"
          :rows="3"
          :max-length="120"
          show-word-limit
          placeholder="介绍一下自己"
        />
      </view>

      <view class="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <VButton variant="ghost" native-type="button" @click="emit('cancel')">
          取消
        </VButton>
        <VButton native-type="submit" :disabled="!canSubmit" :loading="loading" loading-text="保存中...">
          保存资料
        </VButton>
      </view>
    </form>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
