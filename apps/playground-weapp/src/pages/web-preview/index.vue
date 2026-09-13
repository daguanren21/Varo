<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'wevu'
import VInputNumber from '../../components/ui/input-number.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VDateField from '../../components/ui/v-date-field.vue'
import VInput from '../../components/ui/v-input.vue'
import VPullRefresh from '../../components/ui/v-pull-refresh.vue'
import VRadio from '../../components/ui/v-radio.vue'
import VSignature from '../../components/ui/v-signature.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import VToastRegion from '../../components/ui/v-toast-region.vue'
import VToast from '../../components/ui/v-toast.vue'
import VWatermark from '../../components/ui/v-watermark.vue'
import PreviewContextProvider from './PreviewContextProvider.vue'

const buttonDisabled = shallowRef(false)
const buttonClickCount = shallowRef(0)
const buttonEventCount = shallowRef(0)
const disabledButtonEventCount = shallowRef(0)
const lastButtonEvent = shallowRef('尚未收到 click 事件')

type PreviewToastType = 'loading' | 'success'

const motionSwitchValue = shallowRef(false)
const motionRadioValue = shallowRef<'message' | 'email' | 'none'>('message')
const motionQuantity = shallowRef(2)
const motionToastType = shallowRef<PreviewToastType>('loading')
const motionToastTitle = shallowRef('正在同步')
const motionToastMessage = shallowRef('正在同步组件设计。')
const motionToastActionCount = shallowRef(0)
const motionWarningVisible = shallowRef(true)
let motionToastTimer: ReturnType<typeof setTimeout> | undefined

const inputValue = shallowRef('Varo controlled value')
const inputFocused = shallowRef(false)
const inputFocusRequested = shallowRef(false)
const inputResetCount = shallowRef(0)
const inputUpdateEventCount = shallowRef(0)
const inputFocusEventCount = shallowRef(0)
const inputBlurEventCount = shallowRef(0)
const lastInputEvent = shallowRef('等待输入、聚焦或失焦')

const dateValue = shallowRef('2026-01-31')
const dateVisible = shallowRef(false)
const dateStatus = shallowRef('等待选择日期')

const pullRefreshLoading = shallowRef(false)
const pullRefreshCount = shallowRef(0)
let pullRefreshTimer: ReturnType<typeof setTimeout> | undefined

interface PreviewSignatureStroke {
  points: Array<{ x: number, y: number }>
}

const signatureValue = shallowRef<PreviewSignatureStroke[]>([{
  points: [
    { x: 0.18, y: 0.65 },
    { x: 0.31, y: 0.38 },
    { x: 0.43, y: 0.69 },
    { x: 0.57, y: 0.31 },
    { x: 0.72, y: 0.58 },
    { x: 0.84, y: 0.42 },
  ],
}])
const signatureStatus = shallowRef('已回放 1 笔签名')
const secondarySignatureValue = shallowRef<PreviewSignatureStroke[]>([{
  points: [
    { x: 0.2, y: 0.25 },
    { x: 0.8, y: 0.75 },
  ],
}])
const secondarySignatureStatus = shallowRef('副签名保持独立')
const watermarkActionCount = shallowRef(0)

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
const motionDiagnostic = computed(() => `switch=${motionSwitchValue.value};radio=${motionRadioValue.value};toast=${motionToastType.value};warning=${motionWarningVisible.value};actions=${motionToastActionCount.value};quantity=${motionQuantity.value}`)
const inputFocusState = computed(() => inputFocused.value ? 'focused' : inputFocusRequested.value ? 'requested' : 'blurred')
const inputDiagnostic = computed(() => `value=${inputValue.value};focus=${inputFocusState.value};updates=${inputUpdateEventCount.value}`)
const contextTreeState = computed(() => contextMounted.value ? 'mounted' : 'unmounted')
const contextTreeToggleLabel = computed(() => contextMounted.value ? '卸载 Provider / Consumer' : '重新挂载 Provider / Consumer')
const contextUpdateDisabled = computed(() => !contextMounted.value)
const contextLifecycleDiagnostic = computed(() => `tree=${contextTreeState.value};provider=${providerMountedCount.value}/${providerUnmountedCount.value};consumer=${consumerMountedCount.value}/${consumerUnmountedCount.value}`)
const dateDiagnostic = computed(() => `value=${dateValue.value};visible=${dateVisible.value};status=${dateStatus.value}`)
const pullRefreshItems = shallowRef(createPullRefreshItems(0))
const pullRefreshDiagnostic = computed(() => `loading=${pullRefreshLoading.value};count=${pullRefreshCount.value}`)
const signatureDiagnostic = computed(() => {
  const points = signatureValue.value.at(-1)?.points ?? []
  const coordinates = points.map(point => `${point.x.toFixed(4)},${point.y.toFixed(4)}`).join('|')
  return `strokes=${signatureValue.value.length};status=${signatureStatus.value};points=${coordinates}`
})
const secondarySignatureDiagnostic = computed(() => {
  const points = secondarySignatureValue.value.at(-1)?.points ?? []
  const coordinates = points.map(point => `${point.x.toFixed(4)},${point.y.toFixed(4)}`).join('|')
  return `strokes=${secondarySignatureValue.value.length};status=${secondarySignatureStatus.value};points=${coordinates}`
})
const watermarkDiagnostic = computed(() => `actions=${watermarkActionCount.value}`)

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

function updateMotionRadio(value: string | number | boolean) {
  motionRadioValue.value = value as 'message' | 'email' | 'none'
}

function updateMotionQuantity(value: number) {
  motionQuantity.value = value
}
function morphMotionToast() {
  clearTimeout(motionToastTimer)
  motionToastType.value = 'loading'
  motionToastTitle.value = '正在同步'
  motionToastMessage.value = '正在同步组件设计。'
  motionToastTimer = setTimeout(() => {
    motionToastTimer = undefined
    motionToastType.value = 'success'
    motionToastTitle.value = '同步完成'
    motionToastMessage.value = '按钮、开关与单选样式已更新。'
  }, 700)
}

function useMotionToastAction() {
  motionToastActionCount.value += 1
}

function updateMotionWarningVisible(visible: boolean) {
  motionWarningVisible.value = visible
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

function updateDateValue(value: string) {
  dateValue.value = value
  dateStatus.value = `日期列更新为 ${value}`
}

function updateDateVisible(visible: boolean) {
  dateVisible.value = visible
}

function confirmDate(value: string) {
  dateValue.value = value
  dateStatus.value = `已确认 ${value}`
}

function cancelDate() {
  dateStatus.value = '已取消日期选择'
}

function createPullRefreshItems(refreshCount: number) {
  return Array.from({ length: 6 }, (_, index) => `刷新 ${refreshCount + 1}.${index + 1}`)
}

function refreshFeed() {
  if (pullRefreshLoading.value) {
    return
  }
  pullRefreshLoading.value = true
  pullRefreshTimer = setTimeout(() => {
    pullRefreshCount.value += 1
    pullRefreshItems.value = createPullRefreshItems(pullRefreshCount.value)
    pullRefreshLoading.value = false
    pullRefreshTimer = undefined
  }, 500)
}

function updateSignature(value: PreviewSignatureStroke[]) {
  signatureValue.value = value
  signatureStatus.value = value.length === 0 ? '签名为空' : `已提交 ${value.length} 笔签名`
}

function recordSignatureClear() {
  signatureStatus.value = '已清除签名'
}

function updateSecondarySignature(value: PreviewSignatureStroke[]) {
  secondarySignatureValue.value = value
  secondarySignatureStatus.value = value.length === 0 ? '副签名为空' : `副签名已提交 ${value.length} 笔`
}

function useWatermarkedDocument() {
  watermarkActionCount.value += 1
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

onBeforeUnmount(() => {
  clearTimeout(pullRefreshTimer)
  clearTimeout(motionToastTimer)
})
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
        <VInput
          aria-label="Hidden native input"
          class-name="hidden"
          hidden
          value="hidden"
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

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        Varo 状态反馈与微动效
      </template>
      <template #description>
        主题色不变；按钮 press、Switch 拉伸、Radio 内点和 Toast 原位状态变化使用统一 motion token。
      </template>

      <view class="grid min-w-0 gap-4">
        <view class="flex items-center justify-between gap-3">
          <view class="grid gap-1">
            <text class="text-sm font-bold">
              消息通知
            </text>
            <text class="text-xs text-[var(--varo-ui-text-muted)]">
              按住开关可观察 thumb 拉伸反馈
            </text>
          </view>
          <VSwitch v-model="motionSwitchValue" aria-label="消息通知" />
        </view>

        <view class="varo-radio-group" data-direction="horizontal">
          <VRadio
            :checked="motionRadioValue === 'message'"
            label="站内信"
            value="message"
            @change="updateMotionRadio"
          />
          <VRadio
            :checked="motionRadioValue === 'email'"
            label="邮件"
            value="email"
            @change="updateMotionRadio"
          />
          <VRadio
            :checked="motionRadioValue === 'none'"
            label="不通知"
            value="none"
            @change="updateMotionRadio"
          />
        </view>

        <view class="flex items-center justify-between gap-3 rounded-xl bg-[var(--varo-ui-fill)] p-3">
          <view class="grid min-w-0 gap-1">
            <text class="text-sm font-bold">
              席位数量
            </text>
            <text class="text-xs text-[var(--varo-ui-text-muted)]">
              紧凑步进器不挤压相邻文案
            </text>
          </view>
          <VInputNumber
            :min="1"
            :max="5"
            :value="motionQuantity"
            @update:value="updateMotionQuantity"
          />
        </view>

        <view class="grid grid-cols-2 gap-2">
          <VButton block @click="morphMotionToast">
            状态切换
          </VButton>
          <VButton block variant="ghost" @click="useMotionToastAction">
            Ghost 操作 · {{ motionToastActionCount }}
          </VButton>
        </view>

        <VToastRegion inline>
          <VToast
            :visible="true"
            :type="motionToastType"
            :title="motionToastTitle"
            :message="motionToastMessage"
            action-text="查看"
            action-label="查看同步结果"
            @action="useMotionToastAction"
          />
          <VToast
            :visible="motionWarningVisible"
            type="warning"
            title="需要检查"
            message="有两个字段仍需确认。"
            closeable
            @update:visible="updateMotionWarningVisible"
          />
        </VToastRegion>

        <view
          class="break-all rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="motion-state"
          :data-preview-value="motionDiagnostic"
        >
          {{ motionDiagnostic }}
        </view>
      </view>
    </VCard>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        DateField 与 Picker 组合
      </template>
      <template #description>
        DateField 负责日期字段，Picker 负责年、月、日三列；Calendar 保持独立月历。
      </template>

      <view class="grid gap-3">
        <VDateField
          cancel-text="取消"
          confirm-text="确认"
          :max-year="2027"
          :min-year="2025"
          placeholder="请选择日期"
          title="开票日期"
          :value="dateValue"
          :visible="dateVisible"
          @cancel="cancelDate"
          @confirm="confirmDate"
          @update:value="updateDateValue"
          @update:visible="updateDateVisible"
        />
        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="date-field-state"
          :data-preview-value="dateDiagnostic"
        >
          <text>当前值：{{ dateValue }}</text>
          <text>Picker：{{ dateVisible ? 'open' : 'closed' }}</text>
          <text>{{ dateStatus }}</text>
        </view>
      </view>
    </VCard>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        PullRefresh 原生下拉刷新
      </template>
      <template #description>
        小程序使用 scroll-view refresher；loading 由父级完成后复位。
      </template>

      <view class="grid gap-3">
        <VPullRefresh
          class-name="h-56 overflow-hidden rounded-xl border border-[var(--varo-ui-border)]"
          :loading="pullRefreshLoading"
          loading-text="正在刷新"
          @refresh="refreshFeed"
        >
          <view
            v-for="item in (pullRefreshItems || [])"
            :key="item"
            class="border-b border-[var(--varo-ui-border)] px-4 py-3 text-sm"
          >
            {{ item }}
          </view>
        </VPullRefresh>
        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="pull-refresh-state"
          :data-preview-value="pullRefreshDiagnostic"
        >
          <text>刷新次数：{{ pullRefreshCount }}</text>
          <text>状态：{{ pullRefreshLoading ? 'loading' : 'idle' }}</text>
        </view>
      </view>
    </VCard>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        Signature 原生手写签名
      </template>
      <template #description>
        小程序使用 canvas 与触摸事件；两个实例独立回放、绘制和清除。
      </template>

      <view class="grid gap-3">
        <VSignature
          aria-label="主手写签名板"
          clear-text="清除主签名"
          :height="168"
          :value="signatureValue"
          @clear="recordSignatureClear"
          @update:value="updateSignature"
        />
        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="signature-state"
          :data-preview-value="signatureDiagnostic"
        >
          <text>主签名笔画数：{{ signatureValue.length }}</text>
          <text>{{ signatureStatus }}</text>
        </view>
        <VSignature
          aria-label="副手写签名板"
          clear-text="清除副签名"
          :height="120"
          :value="secondarySignatureValue"
          @update:value="updateSecondarySignature"
        />
        <view
          class="grid gap-1 rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="secondary-signature-state"
          :data-preview-value="secondarySignatureDiagnostic"
        >
          <text>副签名笔画数：{{ secondarySignatureValue.length }}</text>
          <text>{{ secondarySignatureStatus }}</text>
        </view>
      </view>
    </VCard>

    <VCard class-name="mb-3" variant="outline">
      <template #title>
        Watermark 原生内容水印
      </template>
      <template #description>
        重复文本覆盖层不截获指针事件，插槽按钮保持可操作。
      </template>

      <view class="grid gap-3">
        <VWatermark
          class-name="rounded-xl border border-[var(--varo-ui-border)]"
          color="#172033"
          content="INTERNAL · VARO"
          :font-size="12"
          :gap-x="150"
          :gap-y="76"
          :opacity="0.14"
          :rotate="-18"
        >
          <view class="grid min-h-44 gap-5 bg-[var(--varo-ui-surface)] p-5">
            <view class="grid gap-1">
              <text class="text-xs text-[var(--varo-ui-text-muted)]">
                受保护文档
              </text>
              <text class="text-xl font-black">
                订单结算报告
              </text>
            </view>
            <text class="text-3xl font-black">
              ¥ 482,600
            </text>
            <VButton @click="useWatermarkedDocument">
              查看文档 · {{ watermarkActionCount }}
            </VButton>
          </view>
        </VWatermark>
        <view
          class="rounded-xl bg-[var(--varo-ui-fill)] p-3 text-xs"
          data-preview-field="watermark-state"
          :data-preview-value="watermarkDiagnostic"
        >
          插槽操作次数：{{ watermarkActionCount }}
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
