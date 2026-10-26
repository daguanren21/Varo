<script setup lang="ts">
import type {
  RegionValue,
  VaroRegionLoadContext,
  VaroRegionOption,
  VaroRegionSelection,
} from '../../components/ui/region-picker.types'
import { computed, shallowRef, watch } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VInputNumber from '../../components/ui/input-number.vue'
import VButton from '../../components/ui/v-button.vue'
import VDateField from '../../components/ui/v-date-field.vue'
import VInputOtp from '../../components/ui/v-input-otp.vue'
import VInput from '../../components/ui/v-input.vue'
import VPicker from '../../components/ui/v-picker.vue'
import VRegionPicker from '../../components/ui/v-region-picker.vue'
import VSearchbar from '../../components/ui/v-searchbar.vue'
import VTextarea from '../../components/ui/v-textarea.vue'
import VTimeField from '../../components/ui/v-time-field.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('input')
const copy = computed(() => en.value
  ? {
      requiredTitle: 'Required and clearable',
      required: 'Required',
      displayName: 'Display name',
      namePlaceholder: 'e.g. Avery Lin',
      nameError: 'Enter a display name.',
      affixes: 'Prefix and suffix',
      urlPlaceholder: 'project-name',
      inputTextarea: 'Textarea',
      bioPlaceholder: 'Add a short description',
      states: 'States',
      readonly: 'Read only',
      disabled: 'Disabled',
      disabledValue: 'Unavailable',
      quantityTitle: 'Purchase seats',
      quantityHint: 'Up to 5 seats per order',
      quantityProduct: 'Varo Pro seat',
      perSeat: '$39 / seat',
      subtotal: 'Subtotal',
      decrease: 'Decrease seats',
      increase: 'Increase seats',
      quantity: 'Number of seats',
      searchTitle: 'Find a component',
      searchHint: 'Search 48 cross-platform components',
      searchPlaceholder: 'Search',
      searchResults: 'Results',
      formCategory: 'Form component',
      textareaTitle: 'Issue details',
      textareaHint: 'Describe the steps and expected result',
      textareaPlaceholder: 'Enter content',
      otpBasic: 'Basic usage',
      otpLabel: 'One-time password',
      otpHint: 'Enter a 6-digit code, such as 012345.',
      otpMasked: 'Masking and separators',
      otpMaskedLabel: 'Masked one-time password',
      otpInvalid: 'Validation',
      otpInvalidLabel: '4-digit one-time password',
      otpReadonlyLabel: 'Read-only one-time password',
      otpDisabledLabel: 'Disabled one-time password',
      complete: 'Complete',
      empty: 'Not entered',
      cancel: 'Cancel',
      confirm: 'Confirm',
      dateTitle: 'Invoice date',
      datePlaceholder: 'Select date',
      dateCancelled: 'Selection cancelled; the committed date was preserved.',
      appointmentTitle: 'Appointment time',
      appointmentHint: '09:00–18:00 · 15-minute steps',
      timePlaceholder: 'Select time',
      timeCancelled: 'Selection cancelled; the committed time was preserved.',
      clear: 'Clear',
      confirmed: 'Confirmed',
      draft: 'Draft',
      deliveryTitle: 'Delivery window',
      deliveryHint: 'Choose a convenient time',
      timeSelected: 'Delivery window selected',
      changeTime: 'Change time',
      pickerCancelled: 'Selection cancelled; the previous delivery window was preserved.',
      notSelected: 'Not selected',
      morning: 'Morning · 09:00–12:00',
      afternoon: 'Afternoon · 13:00–17:00',
      evening: 'Evening · 18:00–21:00',
      regionTitle: 'Activity location',
      regionOpen: 'Select region dynamically',
      regionPickerTitle: 'Select region',
      regionPlaceholder: 'Select',
      regionEmpty: 'No regions available',
      regionLoading: 'Loading…',
      regionError: 'Region service is temporarily unavailable',
      regionRetry: 'Try again',
      regionHint: 'Opening loads the root options; choosing a parent loads its children by path and keeps the panel open. The Zhejiang city request fails once. Use “Try again” to recover, then confirm the complete path.',
      requestIdle: 'Waiting for request',
      requestLoading: 'Loading',
      requestSuccess: 'Request succeeded',
      requestError: 'Request failed; retry available',
      china: 'China',
      zhejiang: 'Zhejiang',
      shanghai: 'Shanghai',
      hangzhou: 'Hangzhou',
      xihu: 'Xihu',
      binjiang: 'Binjiang',
      pudong: 'Pudong',
    }
  : {
      requiredTitle: '必填与清空',
      required: '必填',
      displayName: '显示名称',
      namePlaceholder: '例如：林默',
      nameError: '请输入显示名称。',
      affixes: '前后缀',
      urlPlaceholder: '项目名称',
      inputTextarea: '文本域',
      bioPlaceholder: '补充简短说明',
      states: '状态',
      readonly: '只读',
      disabled: '禁用',
      disabledValue: '不可编辑',
      quantityTitle: '购买席位',
      quantityHint: '每单最多购买 5 个',
      quantityProduct: 'Varo Pro 专业版',
      perSeat: '¥39 / 席位',
      subtotal: '小计',
      decrease: '减少席位',
      increase: '增加席位',
      quantity: '席位数量',
      searchTitle: '搜索组件',
      searchHint: '在 48 个跨端组件中查找',
      searchPlaceholder: '搜索',
      searchResults: '搜索结果',
      formCategory: '表单组件',
      textareaTitle: '问题描述',
      textareaHint: '说明复现步骤与预期结果',
      textareaPlaceholder: '请输入内容',
      otpBasic: '基础用法',
      otpLabel: '一次性验证码',
      otpHint: '请输入 6 位验证码，例如 012345。',
      otpMasked: '掩码与分隔符',
      otpMaskedLabel: '掩码验证码',
      otpInvalid: '校验',
      otpInvalidLabel: '4 位验证码',
      otpReadonlyLabel: '只读验证码',
      otpDisabledLabel: '禁用验证码',
      complete: '输入完成',
      empty: '尚未输入',
      cancel: '取消',
      confirm: '确定',
      dateTitle: '开票日期',
      datePlaceholder: '请选择日期',
      dateCancelled: '已取消，保留原日期。',
      appointmentTitle: '预约时间',
      appointmentHint: '09:00–18:00 · 每 15 分钟',
      timePlaceholder: '请选择时间',
      timeCancelled: '已取消，保留原时间。',
      clear: '清空',
      confirmed: '已确认',
      draft: '草稿',
      deliveryTitle: '配送时段',
      deliveryHint: '选择方便收货的时间',
      timeSelected: '已选择配送时段',
      changeTime: '修改时段',
      pickerCancelled: '已取消，保留原配送时段。',
      notSelected: '尚未选择',
      morning: '上午 · 09:00–12:00',
      afternoon: '下午 · 13:00–17:00',
      evening: '晚间 · 18:00–21:00',
      regionTitle: '活动地点',
      regionOpen: '动态选择地区',
      regionPickerTitle: '选择地区',
      regionPlaceholder: '请选择',
      regionEmpty: '暂无可选地区',
      regionLoading: '加载中…',
      regionError: '地区服务暂时不可用',
      regionRetry: '重新请求',
      regionHint: '打开时请求根节点，选择父级后保持面板打开，按 path 查询子级；浙江城市接口首次失败，用面板内“重新请求”恢复，再确认完整地区路径。',
      requestIdle: '等待请求',
      requestLoading: '请求中',
      requestSuccess: '请求成功',
      requestError: '请求失败，可重试',
      china: '中国',
      zhejiang: '浙江省',
      shanghai: '上海市',
      hangzhou: '杭州市',
      xihu: '西湖区',
      binjiang: '滨江区',
      pudong: '浦东新区',
    })

const inputValue = shallowRef('')
const inputUrl = shallowRef('varo-ui')
const inputBio = shallowRef('')
const textareaValue = shallowRef('')
watch(en, (english) => {
  inputValue.value = english ? 'Avery Lin' : '林默'
  inputBio.value = english ? 'Registry-first mobile UI.' : 'Registry-first 移动端 UI。'
  textareaValue.value = english
    ? 'The confirmation button does not respond after selecting a date.'
    : '选择日期后点击确认按钮没有响应。'
}, { immediate: true })
const inputInvalid = computed(() => inputValue.value.trim().length === 0)
const inputInvalidData = computed(() => String(inputInvalid.value))
const inputError = computed(() => inputInvalid.value ? copy.value.nameError : '')

const inputNumberValue = shallowRef(2)
const subtotal = computed(() => `¥${inputNumberValue.value * 39}`)
const searchValue = shallowRef('Form')
const componentSearchResults = computed(() => {
  const query = searchValue.value.trim().toLocaleLowerCase()
  if (!query) { return [] }
  return ['Form', 'FormItem', 'Input', 'Searchbar'].filter(name => name.toLocaleLowerCase().includes(query))
})

const otpValue = shallowRef('')
const otpMaskedValue = shallowRef('')
const otpInvalidValue = shallowRef('')
const otpCompleted = shallowRef('')
const otpStatus = computed(() => {
  if (otpCompleted.value) { return `${copy.value.complete}：${otpCompleted.value}` }
  return `${otpValue.value.length}/6 · ${otpValue.value || copy.value.empty}`
})
function updateOtp(value: string) {
  otpValue.value = value
  otpCompleted.value = ''
}
function completeOtp(value: string) {
  otpCompleted.value = value
}

const dateValue = shallowRef('2026-05-18')
const dateVisible = shallowRef(false)
const dateStatus = shallowRef('')
const dateResult = computed(() => dateStatus.value || dateValue.value)
const dateConfirmText = computed(() => en.value ? 'Confirm' : '确认')
function previewDate(value: string) {
  dateStatus.value = `${copy.value.draft}：${value}`
}
function confirmDate(value: string) {
  dateStatus.value = `${copy.value.confirmed}：${value}`
}
function cancelDate() {
  dateStatus.value = copy.value.dateCancelled
}

const timeValue = shallowRef('09:30')
const timeVisible = shallowRef(false)
const timeStatus = shallowRef('')
const timeResult = computed(() => timeStatus.value || timeValue.value || copy.value.notSelected)
function previewTime(value: string) {
  timeStatus.value = `${copy.value.draft}：${value}`
}
function confirmTime(value: string) {
  timeStatus.value = `${copy.value.confirmed}：${value}`
}
function cancelTime() {
  timeStatus.value = copy.value.timeCancelled
}

const pickerValue = shallowRef<string | number | (string | number)[] | undefined>('morning')
const pickerVisible = shallowRef(true)
const pickerConfirmed = shallowRef('')
const pickerCancelled = shallowRef(false)
const pickerColumns = computed(() => [
  { label: copy.value.morning, value: 'morning' },
  { label: copy.value.afternoon, value: 'afternoon' },
  { label: copy.value.evening, value: 'evening' },
])
const pickerResult = computed(() => pickerConfirmed.value || copy.value.notSelected)
function confirmPicker(payload: { option?: { label: string } | Array<{ label: string } | undefined> }) {
  pickerConfirmed.value = Array.isArray(payload.option)
    ? payload.option.map(option => option?.label).filter(Boolean).join(' / ')
    : payload.option?.label ?? ''
  pickerCancelled.value = false
  pickerVisible.value = false
}
function cancelPicker() {
  pickerCancelled.value = true
  pickerVisible.value = false
}
function openPicker() {
  pickerCancelled.value = false
  pickerVisible.value = true
}

const regionVisible = shallowRef(false)
const regionPath = shallowRef<RegionValue[]>([])
const regionSelection = shallowRef<VaroRegionSelection | undefined>(undefined)
const regionOptions: VaroRegionOption[] = []
const requestState = shallowRef<'idle' | 'loading' | 'success' | 'error'>('idle')
const requestPath = shallowRef('/api/regions?parent=root')
const requestCount = shallowRef(0)
const requestLabel = computed(() => en.value
  ? `Dynamic API · Request ${requestCount.value}`
  : `动态接口 · 第 ${requestCount.value} 次请求`)
const failedRegionPaths = new Set<string>()
const regionResponses = computed<Record<string, VaroRegionOption[]>>(() => ({
  'root': [{ label: copy.value.china, value: 'cn', hasChildren: true }],
  'cn': [
    { label: copy.value.zhejiang, value: 'zhejiang', hasChildren: true },
    { label: copy.value.shanghai, value: 'shanghai', hasChildren: true },
  ],
  'cn/zhejiang': [{ label: copy.value.hangzhou, value: 'hangzhou', hasChildren: true }],
  'cn/zhejiang/hangzhou': [
    { label: copy.value.xihu, value: 'xihu', latitude: 30.259, longitude: 120.13 },
    { label: copy.value.binjiang, value: 'binjiang', latitude: 30.208, longitude: 120.212 },
  ],
  'cn/shanghai': [{ label: copy.value.pudong, value: 'pudong', latitude: 31.221, longitude: 121.544 }],
}))
const regionLabel = computed(() => regionSelection.value?.labels.join(' / ') || copy.value.notSelected)
const regionCoordinates = computed(() => {
  const selection = regionSelection.value
  if (!selection || selection.latitude === undefined || selection.longitude === undefined) { return '' }
  return `${selection.latitude}, ${selection.longitude}`
})
const requestStateLabel = computed(() => ({
  idle: copy.value.requestIdle,
  loading: copy.value.requestLoading,
  success: copy.value.requestSuccess,
  error: copy.value.requestError,
})[requestState.value])
function regionKey(context: VaroRegionLoadContext) {
  return context.path.length ? context.path.join('/') : 'root'
}
async function loadRegions(context: VaroRegionLoadContext): Promise<VaroRegionOption[]> {
  const key = regionKey(context)
  requestCount.value += 1
  await new Promise(resolve => setTimeout(resolve, 320))
  if (key === 'cn/zhejiang' && !failedRegionPaths.has(key)) {
    failedRegionPaths.add(key)
    throw new Error('simulated region service failure')
  }
  return regionResponses.value[key] ?? []
}
function startRegionLoad(context: VaroRegionLoadContext) {
  requestPath.value = `/api/regions?parent=${encodeURIComponent(regionKey(context))}`
  requestState.value = 'loading'
}
function finishRegionLoad() {
  requestState.value = 'success'
}
function failRegionLoad() {
  requestState.value = 'error'
}
function confirmRegion(selection: VaroRegionSelection) {
  regionSelection.value = selection
}
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <template v-if="component === 'input'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="required" :data-invalid="inputInvalidData">
        <view class="docs-demo__row justify-between">
          <text class="docs-demo__heading">
            {{ copy.requiredTitle }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.required }}
          </text>
        </view>
        <VInput
          :aria-label="copy.displayName"
          clearable
          :error-message="inputError"
          :invalid="inputInvalid"
          :max-length="16"
          :placeholder="copy.namePlaceholder"
          show-word-limit
          :value="inputValue"
          @update:value="inputValue = $event"
        />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="affixes">
        <text class="docs-demo__heading">
          {{ copy.affixes }}
        </text>
        <VInput
          :aria-label="copy.affixes"
          clearable
          :placeholder="copy.urlPlaceholder"
          :value="inputUrl"
          @update:value="inputUrl = $event"
        >
          <template #prefix>
            <text class="docs-demo__muted">
              https://
            </text>
          </template>
          <template #suffix>
            <text class="docs-demo__muted">
              .com
            </text>
          </template>
        </VInput>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="states">
        <text class="docs-demo__heading">
          {{ copy.states }}
        </text>
        <view class="grid grid-cols-2 gap-3">
          <view class="grid gap-2" data-docs-state="readonly">
            <text class="docs-demo__muted">
              {{ copy.readonly }}
            </text>
            <VInput :aria-label="copy.readonly" value="INV-2026-042" readonly />
          </view>
          <view class="grid gap-2" data-docs-state="disabled">
            <text class="docs-demo__muted">
              {{ copy.disabled }}
            </text>
            <VInput :aria-label="copy.disabled" disabled :value="copy.disabledValue" />
          </view>
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="textarea">
        <text class="docs-demo__heading">
          {{ copy.inputTextarea }}
        </text>
        <VInput
          :aria-label="copy.inputTextarea"
          :max-length="60"
          :placeholder="copy.bioPlaceholder"
          :rows="3"
          show-word-limit
          type="textarea"
          :value="inputBio"
          @update:value="inputBio = $event"
        />
      </view>
    </template>

    <view v-else-if="component === 'input-number'" class="docs-demo__section docs-demo__stack" data-docs-case="purchase-seats">
      <view class="flex flex-wrap items-start justify-between gap-3">
        <view class="grid gap-1">
          <text class="docs-demo__heading">
            {{ copy.quantityTitle }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.quantityHint }}
          </text>
        </view>
        <text class="docs-demo__value" data-docs-state="subtotal" aria-live="polite">
          {{ copy.subtotal }} {{ subtotal }}
        </text>
      </view>
      <view class="flex items-center justify-between gap-3">
        <view class="grid gap-1">
          <text class="docs-demo__heading">
            {{ copy.quantityProduct }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.perSeat }}
          </text>
        </view>
        <VInputNumber
          :decrease-aria-label="copy.decrease"
          :increase-aria-label="copy.increase"
          :input-aria-label="copy.quantity"
          :min="1"
          :max="5"
          :value="inputNumberValue"
          @update:value="inputNumberValue = $event"
        />
      </view>
    </view>

    <template v-else-if="component === 'input-otp'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="basic">
        <text class="docs-demo__heading">
          {{ copy.otpBasic }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.otpHint }}
        </text>
        <VInputOtp :input-aria-label="copy.otpLabel" :value="otpValue" @update:value="updateOtp" @complete="completeOtp" />
        <text class="docs-demo__value" data-docs-state="otp" aria-live="polite">
          {{ otpStatus }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="mask-separator">
        <text class="docs-demo__heading">
          {{ copy.otpMasked }}
        </text>
        <VInputOtp
          :input-aria-label="copy.otpMaskedLabel"
          mask
          separator="·"
          :value="otpMaskedValue"
          @update:value="otpMaskedValue = $event"
        />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="validation">
        <text class="docs-demo__heading">
          {{ copy.otpInvalid }}
        </text>
        <VInputOtp
          :input-aria-label="copy.otpInvalidLabel"
          invalid
          :length="4"
          pattern="[0-9]"
          :value="otpInvalidValue"
          @update:value="otpInvalidValue = $event"
        />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="states">
        <text class="docs-demo__heading">
          {{ copy.states }}
        </text>
        <view class="grid gap-2" data-docs-state="readonly">
          <text class="docs-demo__muted">
            {{ copy.readonly }}
          </text>
          <VInputOtp :input-aria-label="copy.otpReadonlyLabel" readonly value="012345" />
        </view>
        <view class="grid gap-2" data-docs-state="disabled">
          <text class="docs-demo__muted">
            {{ copy.disabled }}
          </text>
          <VInputOtp :input-aria-label="copy.otpDisabledLabel" disabled value="012345" />
        </view>
      </view>
    </template>

    <view v-else-if="component === 'searchbar'" class="docs-demo__section docs-demo__stack" data-docs-case="component-search">
      <view class="flex flex-wrap items-start justify-between gap-3">
        <view class="grid gap-1">
          <text class="docs-demo__heading">
            {{ copy.searchTitle }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.searchHint }}
          </text>
        </view>
        <text class="docs-demo__value" data-docs-state="search-count" aria-live="polite">
          {{ componentSearchResults.length }} {{ copy.searchResults }}
        </text>
      </view>
      <VSearchbar
        :action-text="copy.cancel"
        :input-aria-label="copy.searchTitle"
        :placeholder="copy.searchPlaceholder"
        :value="searchValue"
        @cancel="searchValue = ''"
        @update:value="searchValue = $event"
      />
      <view v-if="componentSearchResults.length > 0" class="docs-demo__stack" data-docs-state="search-results" aria-live="polite">
        <view v-for="name in componentSearchResults" :key="name" class="flex items-center justify-between gap-3 border-b border-[var(--varo-ui-border)] py-2">
          <text class="docs-demo__heading">
            {{ name }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.formCategory }}
          </text>
        </view>
      </view>
    </view>

    <view v-else-if="component === 'textarea'" class="docs-demo__section docs-demo__stack" data-docs-case="issue-details">
      <view class="grid gap-1">
        <text class="docs-demo__heading">
          {{ copy.textareaTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.textareaHint }}
        </text>
      </view>
      <VTextarea
        :aria-label="copy.textareaTitle"
        :max-length="120"
        :placeholder="copy.textareaPlaceholder"
        :rows="4"
        show-word-limit
        :value="textareaValue"
        @update:value="textareaValue = $event"
      />
    </view>

    <template v-else-if="component === 'date-field'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="invoice-date">
        <VDateField
          :cancel-text="copy.cancel"
          :confirm-text="dateConfirmText"
          :max-year="2027"
          :min-year="2025"
          :placeholder="copy.datePlaceholder"
          :title="copy.dateTitle"
          :value="dateValue"
          :visible="dateVisible"
          @cancel="cancelDate"
          @change="previewDate"
          @confirm="confirmDate"
          @update:value="dateValue = $event"
          @update:visible="dateVisible = $event"
        />
        <text class="docs-demo__value" data-docs-state="date" aria-live="polite">
          {{ dateResult }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="states">
        <text class="docs-demo__heading">
          {{ copy.states }}
        </text>
        <view class="grid gap-2" data-docs-state="readonly">
          <text class="docs-demo__muted">
            {{ copy.readonly }}
          </text>
          <VDateField readonly value="2026-05-18" :title="copy.dateTitle" />
        </view>
        <view class="grid gap-2" data-docs-state="disabled">
          <text class="docs-demo__muted">
            {{ copy.disabled }}
          </text>
          <VDateField disabled :placeholder="copy.datePlaceholder" :title="copy.dateTitle" />
        </view>
      </view>
    </template>

    <template v-else-if="component === 'time-field'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="appointment-time">
        <text class="docs-demo__heading">
          {{ copy.appointmentTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.appointmentHint }}
        </text>
        <VTimeField
          :value="timeValue"
          :visible="timeVisible"
          min="09:00"
          max="18:00"
          :minute-step="15"
          clearable
          :cancel-text="copy.cancel"
          :confirm-text="dateConfirmText"
          :clear-text="copy.clear"
          :placeholder="copy.timePlaceholder"
          :title="copy.appointmentTitle"
          @update:value="timeValue = $event"
          @update:visible="timeVisible = $event"
          @cancel="cancelTime"
          @change="previewTime"
          @confirm="confirmTime"
          @clear="timeStatus = ''"
        />
        <text class="docs-demo__value" data-docs-state="time" aria-live="polite">
          {{ timeResult }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-state="readonly">
        <text class="docs-demo__heading">
          {{ copy.readonly }}
        </text>
        <VTimeField readonly clearable value="09:30" :clear-text="copy.clear" :title="copy.appointmentTitle" />
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-state="disabled">
        <text class="docs-demo__heading">
          {{ copy.disabled }}
        </text>
        <VTimeField disabled clearable value="09:30" :clear-text="copy.clear" :title="copy.appointmentTitle" />
      </view>
    </template>

    <view v-else-if="component === 'region-picker'" class="docs-demo__section docs-demo__stack" data-docs-case="activity-location">
      <view class="flex flex-wrap items-center justify-between gap-3">
        <view class="grid gap-1">
          <text class="docs-demo__muted">
            {{ copy.regionTitle }}
          </text>
          <text class="docs-demo__heading" data-docs-state="region">
            {{ regionLabel }}
          </text>
        </view>
        <VButton class-name="docs-region-open" size="sm" variant="outline" @click="regionVisible = true">
          {{ copy.regionOpen }}
        </VButton>
      </view>
      <view class="docs-demo__card docs-demo__stack" data-docs-state="region-request" :data-state="requestState">
        <view class="grid gap-1">
          <text class="docs-demo__muted">
            {{ requestLabel }}
          </text>
          <text class="text-xs break-all">
            {{ requestPath }}
          </text>
        </view>
        <text class="docs-demo__heading" aria-live="polite">
          {{ requestStateLabel }}
        </text>
      </view>
      <text class="docs-demo__muted">
        {{ copy.regionHint }}
      </text>
      <text v-if="regionCoordinates" class="docs-demo__value" data-docs-state="region-coordinates" aria-live="polite">
        {{ regionCoordinates }}
      </text>
      <VRegionPicker
        :cancel-text="copy.cancel"
        :confirm-text="copy.confirm"
        :empty-text="copy.regionEmpty"
        :error-text="copy.regionError"
        :load-children="loadRegions"
        :loading-text="copy.regionLoading"
        :model-value="regionPath"
        :options="regionOptions"
        :placeholder="copy.regionPlaceholder"
        :retry-text="copy.regionRetry"
        :title="copy.regionPickerTitle"
        :visible="regionVisible"
        @confirm="confirmRegion"
        @load-error="failRegionLoad"
        @load-start="startRegionLoad"
        @load-success="finishRegionLoad"
        @update:modelValue="regionPath = $event"
        @update:visible="regionVisible = $event"
      />
    </view>

    <view v-else-if="component === 'picker'" class="docs-demo__section docs-demo__stack" data-docs-case="delivery-window">
      <view class="flex flex-wrap items-start justify-between gap-3">
        <view class="grid gap-1">
          <text class="docs-demo__heading">
            {{ copy.deliveryTitle }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.deliveryHint }}
          </text>
        </view>
        <view v-if="pickerConfirmed" class="grid gap-1" data-docs-state="picker-confirmed" aria-live="polite">
          <text class="docs-demo__muted">
            {{ copy.timeSelected }}
          </text>
          <text class="docs-demo__value">
            {{ pickerConfirmed }}
          </text>
        </view>
      </view>
      <VPicker
        :cancel-text="copy.cancel"
        :columns="pickerColumns"
        :confirm-text="copy.confirm"
        :title="copy.deliveryTitle"
        :value="pickerValue"
        :visible="pickerVisible"
        @cancel="cancelPicker"
        @confirm="confirmPicker"
        @update:value="pickerValue = $event"
        @update:visible="pickerVisible = $event"
      />
      <view v-if="!pickerVisible" class="docs-demo__card docs-demo__stack" data-docs-state="picker-result" aria-live="polite">
        <text class="docs-demo__heading">
          {{ copy.timeSelected }}
        </text>
        <text class="docs-demo__value">
          {{ pickerResult }}
        </text>
        <text v-if="pickerCancelled" class="docs-demo__muted">
          {{ copy.pickerCancelled }}
        </text>
        <VButton class-name="docs-picker-reopen" size="sm" tone="default" variant="outline" @click="openPicker">
          {{ copy.changeTime }}
        </VButton>
      </view>
    </view>
  </DocsDemoPage>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Input",
  "usingComponents": {}
}
</json>
