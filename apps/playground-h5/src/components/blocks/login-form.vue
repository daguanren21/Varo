<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { VSwitch } from '../ui/switch'
import { cn, type ClassValue } from '../../lib/cn'

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
    title: '欢迎回来'
  }
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
  cn('w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm', props.className)
)

function submit() {
  if (!canSubmit.value) return
  emit('submit', {
    password: password.value,
    phone: phone.value.trim(),
    remember: remember.value
  })
}
</script>

<template>
  <section :class="rootClass" aria-labelledby="login-title">
    <header class="mb-6 space-y-1.5">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Varo Account</p>
      <h2 id="login-title" class="text-2xl font-bold tracking-tight text-slate-950">{{ title }}</h2>
      <p class="text-sm leading-6 text-slate-500">{{ description }}</p>
    </header>

    <form class="space-y-4" @submit.prevent="submit">
      <VInput v-model:value="phone" label="手机号" type="tel" clearable placeholder="请输入手机号" />
      <VInput v-model:value="password" label="密码" type="password" placeholder="请输入密码" />

      <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
        {{ error }}
      </p>

      <div class="flex items-center justify-between gap-4 text-sm">
        <label class="flex items-center gap-2 text-slate-600">
          <VSwitch v-model="remember" />
          <span>记住我</span>
        </label>
        <button class="font-semibold text-teal-700" type="button" @click="emit('forgotPassword')">
          忘记密码？
        </button>
      </div>

      <VButton block native-type="submit" :disabled="!canSubmit" :loading="loading" loading-text="登录中...">
        登录
      </VButton>
    </form>
  </section>
</template>
