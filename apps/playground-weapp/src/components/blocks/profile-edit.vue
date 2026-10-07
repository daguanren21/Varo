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
  cn(
    'box-border w-full bg-[var(--varo-ui-surface)] p-6 text-sm leading-6 text-[var(--varo-ui-text)]',
    String.raw`[&_.varo-input]:!gap-2 [&_.varo-input\_\_label]:!font-medium [&_.varo-input\_\_label]:!text-[var(--varo-ui-text-regular)]`,
    String.raw`[&_.varo-input\_\_body]:!rounded-lg [&_.varo-input[data-focused=false]_.varo-input\_\_body]:!shadow-none [&_.varo-input\_\_control]:!min-h-11 [&_.varo-input\_\_control]:!text-sm`,
    String.raw`[&_.varo-input\_\_clear]:!min-h-11 [&_.varo-input\_\_clear]:!min-w-11 [&_.varo-input\_\_clear]:!-mr-2`,
    String.raw`[&_.varo-select\_\_trigger]:!box-border [&_.varo-select\_\_trigger]:!h-12 [&_.varo-select\_\_trigger]:!min-h-12 [&_.varo-select\_\_trigger]:!rounded-lg`,
    String.raw`[&_.varo-select\_\_filter-input]:!h-11 [&_.varo-select\_\_filter-input]:!min-h-11 [&_.varo-select\_\_filter-input]:!max-h-none [&_.varo-select\_\_filter-input]:!text-sm`,
    String.raw`[&_.varo-select\_\_clear]:!h-11 [&_.varo-select\_\_clear]:!min-h-11 [&_.varo-select\_\_clear]:!max-h-none [&_.varo-select\_\_clear]:!w-11 [&_.varo-select\_\_clear]:!min-w-11 [&_.varo-select\_\_clear]:!max-w-none`,
    String.raw`[&_.varo-select\_\_option]:!min-h-11 [&_.varo-select\_\_option]:!rounded-lg [&_.varo-select\_\_option]:!py-2 [&_.varo-select\_\_option]:!text-sm [&_.varo-select\_\_option]:!leading-6`,
    String.raw`[&_.varo-select\_\_panel]:!rounded-lg [&_.varo-select\_\_panel]:!shadow-none`,
    props.className,
  ),
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
    <view class="mb-6 border-b border-[var(--varo-ui-border-lighter)] pb-6">
      <text id="profile-edit-title" class="block break-words text-xl font-semibold leading-7">
        {{ title }}
      </text>
    </view>

    <form class="grid gap-6" @submit="submit">
      <VInput v-model:value="name" label="姓名" size="lg" clearable placeholder="请输入姓名" />
      <VInput
        v-model:value="phone"
        label="手机号"
        type="tel"
        size="lg"
        :formatter="formatPhone"
        :max-length="11"
        clearable
        placeholder="请输入手机号"
      />
      <view class="grid min-w-0 gap-2 text-sm text-[var(--varo-ui-text-regular)]">
        <text class="font-medium">
          所在城市
        </text>
        <VSelect v-model:value="city" :options="cities" filterable clearable placeholder="请选择城市" />
      </view>
      <VInput
        v-model:value="bio"
        label="个人简介"
        type="textarea"
        size="lg"
        :rows="3"
        :max-length="120"
        show-word-limit
        placeholder="介绍一下自己"
      />

      <view class="flex items-center gap-3 border-t border-[var(--varo-ui-border-lighter)] pt-6">
        <VButton
          size="lg"
          tone="default"
          variant="ghost"
          native-type="button"
          class-name="!min-h-12 !rounded-lg !px-4 !text-sm !font-medium !text-[var(--varo-ui-text-regular)]"
          @click="emit('cancel')"
        >
          取消
        </VButton>
        <view class="min-w-0 flex-1">
          <VButton
            block
            size="lg"
            native-type="submit"
            color="var(--varo-ui-text)"
            foreground-color="var(--varo-ui-surface)"
            class-name="!min-h-12 !rounded-lg !text-sm !shadow-none"
            :disabled="!canSubmit"
            :loading="loading"
            loading-text="保存中..."
          >
            保存资料
          </VButton>
        </view>
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
