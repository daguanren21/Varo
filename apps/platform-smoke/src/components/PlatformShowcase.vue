<script setup lang="ts">
import type { FormRules } from '@varo-ui/headless'
import { computed, reactive, shallowRef } from 'wevu'
import VButton from './ui/v-button.vue'
import VCard from './ui/v-card.vue'
import VCheckbox from './ui/v-checkbox.vue'
import VDrawer from './ui/v-drawer.vue'
import VFormItem from './ui/v-form-item.vue'
import VForm from './ui/v-form.vue'
import VInputOtp from './ui/v-input-otp.vue'
import VInput from './ui/v-input.vue'
import VSwitch from './ui/v-switch.vue'

const target = __VARO_PROFILE__
const maturity = __VARO_PROFILE_MATURITY__
const model = reactive({ name: '', consent: false, notifications: true, otp: '' })
const disabled = shallowRef(false)
const readonly = shallowRef(false)
const drawerOpen = shallowRef(false)
const submitted = shallowRef('Not submitted')
const formStatus = shallowRef('Enter a name and four digits, then submit.')
const otpCompletions = shallowRef(0)
const drawerCloses = shallowRef(0)
const rules: FormRules = {
  name: [
    { required: true, message: 'Enter your name' },
    { min: 2, message: 'Use at least two characters' },
  ],
  otp: [
    { required: true, message: 'Enter the four-digit code' },
    { pattern: '^\\d{4}$', message: 'Use exactly four digits' },
  ],
}
const snapshot = computed(() => JSON.stringify(model))
const disabledLabel = computed(() => disabled.value ? 'Enable controls' : 'Disable controls')
const readonlyLabel = computed(() => readonly.value ? 'Allow editing' : 'Make read-only')
const modeLabel = computed(() => disabled.value ? 'disabled' : readonly.value ? 'read-only' : 'editable')
const drawerState = computed(() => drawerOpen.value ? 'open' : 'closed')

function submit(payload: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(payload.values)
  formStatus.value = 'Submitted locally. No data was sent to a server.'
  drawerOpen.value = true
}

function failed() {
  formStatus.value = 'Not submitted. Correct the field errors and try again.'
}

function reset() {
  Object.assign(model, { name: '', consent: false, notifications: true, otp: '' })
  submitted.value = 'Not submitted'
  formStatus.value = 'Reset. Enter a name and four digits, then submit.'
  otpCompletions.value = 0
}

function complete() {
  otpCompletions.value += 1
}

function closed() {
  drawerCloses.value += 1
}
</script>

<template>
  <view class="platform-smoke-page flex flex-col gap-4 p-4">
    <view class="flex flex-col gap-2">
      <text class="text-xl font-bold">
        Native form and overlay
      </text>
      <text id="profile-label">
        Profile: {{ target }} · {{ maturity }}
      </text>
      <text class="platform-smoke-muted">
        Compilation is not device verification. Exercise every control in the target IDE or host.
      </text>
    </view>

    <VCard variant="outline">
      <VForm :model="model" :rules="rules" :disabled="disabled" @submit="submit" @failed="failed" @reset="reset">
        <VFormItem name="name" label="Name" required>
          <VInput
            v-model:value="model.name"
            input-id="smoke-name"
            aria-label="Name"
            placeholder="At least two characters"
            clearable
            :disabled="disabled"
            :readonly="readonly"
          />
        </VFormItem>
        <VFormItem name="consent" label="Preference">
          <VCheckbox v-model:checked="model.consent" label="Remember my preference" aria-label="Remember my preference" :disabled="disabled" :readonly="readonly" />
        </VFormItem>
        <VFormItem name="notifications" label="Notifications">
          <VSwitch v-model="model.notifications" aria-label="Enable notifications" :disabled="disabled" :readonly="readonly" />
        </VFormItem>
        <VFormItem name="otp" label="Four-digit code" required>
          <VInputOtp v-model:value="model.otp" :length="4" input-aria-label="Four-digit code" :disabled="disabled" :readonly="readonly" @complete="complete" />
        </VFormItem>
        <view class="mt-4 flex flex-wrap gap-2">
          <VButton native-type="submit" :disabled="disabled">
            Submit locally
          </VButton>
          <VButton native-type="reset" tone="default" variant="outline" :disabled="disabled">
            Reset
          </VButton>
        </view>
        <text id="form-status" class="platform-smoke-status" role="status" aria-live="polite">
          {{ formStatus }}
        </text>
      </VForm>
    </VCard>

    <view class="flex flex-wrap gap-2">
      <VButton size="sm" variant="outline" @click="disabled = !disabled">
        {{ disabledLabel }}
      </VButton>
      <VButton size="sm" variant="outline" @click="readonly = !readonly">
        {{ readonlyLabel }}
      </VButton>
      <VButton size="sm" variant="outline" @click="drawerOpen = true">
        Inspect state
      </VButton>
    </view>
    <view class="flex flex-col gap-2" role="status" aria-live="polite">
      <text id="control-mode">
        Controls: {{ modeLabel }}
      </text>
      <text id="live-state" class="platform-smoke-snapshot">
        Live state: {{ snapshot }}
      </text>
      <text id="otp-completions">
        OTP completions: {{ otpCompletions }}
      </text>
      <text id="drawer-state">
        Drawer: {{ drawerState }} · accepted closes: {{ drawerCloses }}
      </text>
      <text id="submitted-state" class="platform-smoke-snapshot">
        Last submission: {{ submitted }}
      </text>
    </view>

    <VDrawer v-model:open="drawerOpen" placement="bottom" closeable round safe-area-inset-bottom @close="closed">
      <view class="flex flex-col gap-4 p-4">
        <text class="text-lg font-bold">
          Current local state
        </text>
        <text class="platform-smoke-snapshot">
          {{ snapshot }}
        </text>
        <text>Dismiss with the close button or overlay; the close count updates on the page.</text>
      </view>
    </VDrawer>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
