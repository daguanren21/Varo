<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VInput from '../../components/ui/v-input.vue'
import PreviewContextProvider from './PreviewContextProvider.vue'

const buttonDisabled = shallowRef(false)
const buttonClickCount = shallowRef(0)
const buttonEventCount = shallowRef(0)
const disabledButtonEventCount = shallowRef(0)
const lastButtonEvent = shallowRef('尚未收到 click 事件')

const inputValue = shallowRef('Varo controlled value')
const inputFocused = shallowRef(false)
const inputFocusRequested = shallowRef(false)
const inputResetCount = shallowRef(0)
const inputUpdateEventCount = shallowRef(0)
const inputFocusEventCount = shallowRef(0)
const inputBlurEventCount = shallowRef(0)
const lastInputEvent = shallowRef('等待输入、聚焦或失焦')

const contextMounted = shallowRef(true)
const contextRevision = shallowRef(1)
const contextValue = shallowRef('来自 Provider 的值 #1')
const providerMountedCount = shallowRef(0)
const providerUnmountedCount = shallowRef(0)
const consumerMountedCount = shallowRef(0)
const consumerUnmountedCount = shallowRef(0)

const buttonStateLabel = computed(() => buttonDisabled.value ? 'disabled' : 'enabled')
const trackedButtonLabel = computed(() => `测试按钮：已点击 ${buttonClickCount.value} 次`)
const toggleButtonLabel = computed(() => buttonDisabled.value ? '启用测试按钮' : '禁用测试按钮')
const buttonDiagnostic = computed(() => `state=${buttonStateLabel.value};clicks=${buttonClickCount.value};events=${buttonEventCount.value}`)
const inputFocusState = computed(() => inputFocused.value ? 'focused' : inputFocusRequested.value ? 'requested' : 'blurred')
const inputDiagnostic = computed(() => `value=${inputValue.value};focus=${inputFocusState.value};updates=${inputUpdateEventCount.value}`)
const contextTreeState = computed(() => contextMounted.value ? 'mounted' : 'unmounted')
const contextTreeToggleLabel = computed(() => contextMounted.value ? '卸载 Provider / Consumer' : '重新挂载 Provider / Consumer')
const contextUpdateDisabled = computed(() => !contextMounted.value)
const contextLifecycleDiagnostic = computed(() => `tree=${contextTreeState.value};provider=${providerMountedCount.value}/${providerUnmountedCount.value};consumer=${consumerMountedCount.value}/${consumerUnmountedCount.value}`)

function recordTrackedButtonClick() {
  buttonClickCount.value += 1
  buttonEventCount.value += 1
  lastButtonEvent.value = `收到 click 事件 #${buttonEventCount.value}`
}

function toggleTrackedButton() {
  buttonDisabled.value = !buttonDisabled.value
  lastButtonEvent.value = `测试按钮切换为 ${buttonStateLabel.value}`
}

function recordUnexpectedDisabledClick() {
  disabledButtonEventCount.value += 1
  lastButtonEvent.value = `错误：禁用按钮发出了 click #${disabledButtonEventCount.value}`
}

function updateInputValue(value: string) {
  inputValue.value = value
  inputUpdateEventCount.value += 1
  lastInputEvent.value = `收到 update:value #${inputUpdateEventCount.value}`
}

function resetInputValue() {
  inputResetCount.value += 1
  inputValue.value = `外部重置值 #${inputResetCount.value}`
  lastInputEvent.value = `父级写入受控值 #${inputResetCount.value}`
}

function requestInputFocus() {
  inputFocusRequested.value = true
  lastInputEvent.value = '父级请求 focus=true'
}

function requestInputBlur() {
  inputFocusRequested.value = false
  lastInputEvent.value = '父级请求 focus=false'
}

function recordInputFocus() {
  inputFocused.value = true
  inputFocusEventCount.value += 1
  lastInputEvent.value = `收到 focus 事件 #${inputFocusEventCount.value}`
}

function recordInputBlur() {
  inputFocused.value = false
  inputFocusRequested.value = false
  inputBlurEventCount.value += 1
  lastInputEvent.value = `收到 blur 事件 #${inputBlurEventCount.value}`
}

function updateContextValue() {
  contextRevision.value += 1
  contextValue.value = `来自 Provider 的值 #${contextRevision.value}`
}

function toggleContextTree() {
  contextMounted.value = !contextMounted.value
}

function recordProviderMounted() {
  providerMountedCount.value += 1
}

function recordProviderUnmounted() {
  providerUnmountedCount.value += 1
}

function recordConsumerMounted() {
  consumerMountedCount.value += 1
}

function recordConsumerUnmounted() {
  consumerUnmountedCount.value += 1
}
</script>

<template>
  <view class="box-border min-h-screen bg-[var(--varo-ui-bg)] px-3 py-4 text-[var(--varo-ui-text)]">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Wevu 原生控件预览
      </text>
      <text class="text-xs leading-5 text-slate-300">
        使用真实 Wevu / glass-easel 构建产物；这不是微信客户端模拟器，未伪造微信专属能力。
      </text>
    </view>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        VButton 事件与禁用态
      </template>
      <template #description>
        动态禁用后，同一个 VButton 不再发出 click；固定禁用按钮的事件数应始终为 0。
      </template>

      <view class="grid gap-3">
        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="button-state"
          :data-preview-value="buttonDiagnostic"
        >
          <text>按钮状态：{{ buttonStateLabel }}</text>
          <text data-preview-field="button-click-count">
            按钮点击计数：{{ buttonClickCount }}
          </text>
          <text data-preview-field="button-event-count">
            click 事件计数：{{ buttonEventCount }}
          </text>
          <text data-preview-field="disabled-button-event-count">
            禁用按钮事件计数：{{ disabledButtonEventCount }}
          </text>
          <text data-preview-field="button-last-event">
            最后事件：{{ lastButtonEvent }}
          </text>
        </view>

        <VButton block :disabled="buttonDisabled" @click="recordTrackedButtonClick">
          {{ trackedButtonLabel }}
        </VButton>
        <view class="grid grid-cols-2 gap-2">
          <VButton block variant="outline" @click="toggleTrackedButton">
            {{ toggleButtonLabel }}
          </VButton>
          <VButton block disabled variant="outline" @click="recordUnexpectedDisabledClick">
            固定禁用按钮
          </VButton>
        </view>
      </view>
    </VCard>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        VInput 受控值与焦点
      </template>
      <template #description>
        输入事件只请求父级更新；重置、focus 与 blur 都有可观察状态。
      </template>

      <view class="grid gap-3">
        <VInput
          aria-label="Web 预览受控输入"
          clearable
          :focus="inputFocusRequested"
          input-id="web-preview-controlled-input"
          label="受控输入"
          placeholder="输入任意本地文本"
          :value="inputValue"
          @blur="recordInputBlur"
          @focus="recordInputFocus"
          @update:value="updateInputValue"
        />
        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="input-state"
          :data-preview-value="inputDiagnostic"
        >
          <text class="break-words" data-preview-field="input-value">
            受控值：{{ inputValue }}
          </text>
          <text data-preview-field="input-focus-state">
            焦点状态：{{ inputFocusState }}
          </text>
          <text>update:value 事件：{{ inputUpdateEventCount }}</text>
          <text>focus / blur 事件：{{ inputFocusEventCount }} / {{ inputBlurEventCount }}</text>
          <text data-preview-field="input-last-event">
            最后事件：{{ lastInputEvent }}
          </text>
        </view>
        <view class="grid grid-cols-3 gap-2">
          <VButton size="sm" variant="outline" @click="resetInputValue">
            外部重置值
          </VButton>
          <VButton size="sm" :disabled="inputFocused" variant="outline" @click="requestInputFocus">
            请求聚焦
          </VButton>
          <VButton size="sm" :disabled="!inputFocused" variant="outline" @click="requestInputBlur">
            移除焦点
          </VButton>
        </view>
      </view>
    </VCard>

    <view
      class="mb-3 grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
      data-preview-field="context-lifecycle"
      :data-preview-value="contextLifecycleDiagnostic"
    >
      <text data-preview-field="context-tree-state">
        Context 树状态：{{ contextTreeState }}
      </text>
      <text data-preview-field="provider-lifecycle">
        Provider 挂载 / 卸载：{{ providerMountedCount }} / {{ providerUnmountedCount }}
      </text>
      <text data-preview-field="consumer-lifecycle">
        Consumer 挂载 / 卸载：{{ consumerMountedCount }} / {{ consumerUnmountedCount }}
      </text>
    </view>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        VCard 插槽中的注入树
      </template>
      <template #description>
        Provider / Consumer 树位于 VCard 默认插槽；缺少 Provider 会直接抛错。
      </template>

      <PreviewContextProvider
        v-if="contextMounted"
        :revision="contextRevision"
        :value="contextValue"
        @consumer-mounted="recordConsumerMounted"
        @consumer-unmounted="recordConsumerUnmounted"
        @mounted="recordProviderMounted"
        @unmounted="recordProviderUnmounted"
      />
      <view v-else class="rounded-xl border border-dashed border-[var(--varo-ui-border)] p-4 text-center text-xs text-[var(--varo-ui-text-regular)]">
        Provider / Consumer 已卸载；重新挂载会增加两者的 mounted 计数。
      </view>

      <template #footer>
        <view class="grid gap-2">
          <VButton block :disabled="contextUpdateDisabled" variant="outline" @click="updateContextValue">
            更新注入值
          </VButton>
          <VButton block tone="default" variant="outline" @click="toggleContextTree">
            {{ contextTreeToggleLabel }}
          </VButton>
        </view>
      </template>
    </VCard>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Wevu 控件预览",
  "usingComponents": {}
}
</json>
