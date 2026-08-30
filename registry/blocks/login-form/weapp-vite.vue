<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import VSwitch from '../ui/v-switch.vue'

interface LoginCredentials {
  password: string
  phone: string
  remember: boolean
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    description?: string
    error?: string
    initialPhone?: string
    loading?: boolean
    title?: string
  }>(),
  {
    description: '使用手机号和密码登录你的账户',
    error: '',
    initialPhone: '',
    loading: false,
    title: '欢迎回来',
  },
)

const emit = defineEmits<{
  forgotPassword: []
  submit: [credentials: LoginCredentials]
}>()

const password = shallowRef('')
const phone = shallowRef(props.initialPhone)
const remember = shallowRef(true)
const canSubmit = computed(() => phone.value.trim().length > 0 && password.value.length > 0 && !props.loading)
const rootClass = computed(() =>
  cn('w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm', props.className),
)

function submit() {
  if (!canSubmit.value) { return }
  emit('submit', {
    password: password.value,
    phone: phone.value.trim(),
    remember: remember.value,
  })
}
</script>

<template>
  <view :class="rootClass" aria-labelledby="login-title">
    <view class="mb-6 grid gap-1.5">
      <text class="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
        Varo Account
      </text>
      <text id="login-title" class="text-2xl font-bold tracking-tight text-slate-950">
        {{ title }}
      </text>
      <text class="text-sm leading-6 text-slate-500">
        {{ description }}
      </text>
    </view>

    <form class="grid" @submit="submit">
      <view class="pb-6">
        <VInput v-model:value="phone" label="手机号" type="tel" clearable placeholder="请输入手机号" />
      </view>
      <view class="pb-5">
        <VInput v-model:value="password" label="密码" type="password" placeholder="请输入密码" />
      </view>

      <text v-if="error" class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
        {{ error }}
      </text>

      <view class="flex items-center justify-between gap-4 pb-5 text-sm">
        <view class="flex items-center gap-2 text-slate-600">
          <VSwitch v-model="remember" />
          <text>记住我</text>
        </view>
        <VButton size="sm" tone="default" variant="ghost" class-name="!min-h-8 !px-2 !font-semibold !text-teal-700" @click="emit('forgotPassword')">
          忘记密码？
        </VButton>
      </view>

      <VButton block native-type="submit" :disabled="!canSubmit" :loading="loading" loading-text="登录中...">
        登录
      </VButton>
    </form>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
