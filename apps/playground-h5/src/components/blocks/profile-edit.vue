<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef } from 'vue'
import { cn } from '../../lib/cn'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { VSelect } from '../ui/select'

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
  cn('w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm', props.className),
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
  <section :class="rootClass" aria-labelledby="profile-edit-title">
    <header class="mb-5">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
        Profile
      </p>
      <h2 id="profile-edit-title" class="mt-1 text-xl font-bold text-slate-950">
        {{ title }}
      </h2>
    </header>

    <form class="space-y-6" @submit.prevent="submit">
      <VInput v-model:value="name" label="姓名" clearable placeholder="请输入姓名" />
      <VInput
        v-model:value="phone"
        label="手机号"
        type="tel"
        :formatter="formatPhone"
        :max-length="11"
        clearable
        placeholder="请输入手机号"
      />
      <label class="grid gap-2 text-sm font-semibold text-slate-700">
        所在城市
        <VSelect v-model:value="city" :options="cities" searchable clearable placeholder="请选择城市" />
      </label>
      <VInput
        v-model:value="bio"
        label="个人简介"
        type="textarea"
        :rows="3"
        :max-length="120"
        show-word-limit
        placeholder="介绍一下自己"
      />

      <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <VButton variant="ghost" native-type="button" @click="emit('cancel')">
          取消
        </VButton>
        <VButton native-type="submit" :disabled="!canSubmit" :loading="loading" loading-text="保存中...">
          保存资料
        </VButton>
      </div>
    </form>
  </section>
</template>
