<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef, useId } from 'vue'
import { cn } from '../../lib/cn'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { VSwitch } from '../ui/switch'

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
const titleId = `login-title-${useId()}`
const canSubmit = computed(() => phone.value.trim().length > 0 && password.value.length > 0 && !props.loading)
const rootClass = computed(() =>
  cn(
    'box-border w-full max-w-md bg-[var(--varo-ui-surface)] p-6 text-sm leading-6 text-[var(--varo-ui-text)]',
    String.raw`[&_.varo-input]:!gap-2 [&_.varo-input\_\_label]:!font-medium [&_.varo-input\_\_label]:!text-[var(--varo-ui-text-regular)]`,
    String.raw`[&_.varo-input\_\_body]:!rounded-lg [&_.varo-input[data-focused=false]_.varo-input\_\_body]:!shadow-none [&_.varo-input\_\_control]:!min-h-11 [&_.varo-input\_\_control]:!text-base`,
    String.raw`[&_.varo-input\_\_clear]:!min-h-11 [&_.varo-input\_\_clear]:!min-w-11 [&_.varo-input\_\_clear]:!-mr-2`,
    props.className,
  ),
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
  <section :class="rootClass" :aria-labelledby="titleId">
    <header class="mb-6 border-b border-[var(--varo-ui-border-lighter)] pb-6">
      <h2 :id="titleId" class="m-0 break-words text-xl font-semibold leading-7">
        {{ title }}
      </h2>
      <p class="mb-0 mt-2 break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
        {{ description }}
      </p>
    </header>

    <form class="grid gap-6" @submit.prevent="submit">
      <VInput
        v-model:value="phone"
        label="手机号"
        type="tel"
        size="lg"
        autocomplete="username"
        clearable
        placeholder="请输入手机号"
      />
      <VInput
        v-model:value="password"
        label="密码"
        type="password"
        size="lg"
        autocomplete="current-password"
        placeholder="请输入密码"
      />

      <p v-if="error" class="m-0 break-words border-l-2 border-[var(--varo-ui-danger)] pl-3 text-sm leading-6 text-[var(--varo-ui-danger-text)]" role="alert">
        {{ error }}
      </p>

      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label
          class="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--varo-ui-text-regular)]"
        >
          <VSwitch v-model="remember" aria-label="记住我" />
          <span>记住我</span>
        </label>
        <VButton tone="default" variant="ghost" class="!min-h-11 !rounded-lg !px-2 !text-sm !font-medium !text-[var(--varo-ui-text-regular)]" @click="emit('forgotPassword')">
          忘记密码？
        </VButton>
      </div>

      <VButton
        block
        size="lg"
        native-type="submit"
        color="var(--varo-ui-text)"
        foreground-color="var(--varo-ui-surface)"
        class="!min-h-12 !rounded-lg !text-sm !shadow-none"
        :disabled="!canSubmit"
        :loading="loading"
        loading-text="登录中..."
      >
        登录
      </VButton>
    </form>
  </section>
</template>
