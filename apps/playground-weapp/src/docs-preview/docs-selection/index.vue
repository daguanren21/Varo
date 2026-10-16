<script setup lang="ts">
import type { FormRules, FormValues, StandardSchemaIssue, StandardSchemaV1, SubmitPayload, UseFormReturn } from '@varo-ui/headless'
import { computed, nextTick, reactive, shallowRef, useTemplateRef } from 'wevu'
import DocsDemoPage from '../../components/DocsDemoPage.vue'
import VInputNumber from '../../components/ui/input-number.vue'
import VSelect from '../../components/ui/select.vue'
import VButton from '../../components/ui/v-button.vue'
import VCheckboxGroup from '../../components/ui/v-checkbox-group.vue'
import VCheckbox from '../../components/ui/v-checkbox.vue'
import VCollapseItem from '../../components/ui/v-collapse-item.vue'
import VCollapse from '../../components/ui/v-collapse.vue'
import VFormItem from '../../components/ui/v-form-item.vue'
import VForm from '../../components/ui/v-form.vue'
import VInputOtp from '../../components/ui/v-input-otp.vue'
import VInput from '../../components/ui/v-input.vue'
import VRadioGroup from '../../components/ui/v-radio-group.vue'
import VRadio from '../../components/ui/v-radio.vue'
import VRate from '../../components/ui/v-rate.vue'
import VSwitch from '../../components/ui/v-switch.vue'
import VTextarea from '../../components/ui/v-textarea.vue'
import { useDocsDemo } from '../../lib/docs-demo'

const { component, en, theme } = useDocsDemo('checkbox')
const copy = computed(() => en.value
  ? {
      disabled: 'Disabled',
      readonly: 'Read only',
      states: 'Disabled and read-only states',
      notifyTitle: 'Notification channels',
      notifyHint: 'Choose up to two',
      notifyWeChat: 'WeChat',
      notifySms: 'SMS',
      notifyEmail: 'Email',
      selected: 'Selected',
      paymentTitle: 'Payment method',
      paymentHint: 'Order #1042 · Secure checkout',
      wechatPay: 'WeChat Pay',
      alipay: 'Alipay',
      cardPay: 'Bank card',
      recommended: 'Recommended',
      orderAmount: 'Pay now · ¥299',
      warehouseTitle: 'Default fulfillment center',
      warehouseHint: 'Affects inventory and shipping fees',
      warehouseSelected: 'Current center',
      selectPlaceholder: 'Select city',
      none: 'None',
      multipleTitle: 'Fulfillment centers',
      multipleHint: 'Select one or more centers. Each selection takes effect immediately.',
      searchTitle: 'Find a fulfillment center',
      searchHint: 'Type a city to filter the available centers.',
      notificationTitle: 'Notification settings',
      notificationHint: 'Choose which updates can interrupt you',
      marketingNotice: 'Product announcements',
      marketingNoticeDesc: 'Occasional feature and campaign updates',
      orderNotice: 'Order status',
      orderNoticeDesc: 'Required for fulfillment updates',
      switchOn: 'On',
      switchOff: 'Off',
      readonlyNotice: 'Notification preference',
      readonlyNoticeDesc: 'View your saved preference',
      reviewTitle: 'Service rating',
      reviewHint: 'Order #1042 · Delivered today',
      reviewScore: 'Your rating',
      savedRating: 'Saved rating',
      unavailableRating: 'Rating unavailable',
      formTitle: 'Submit a project brief',
      formHint: 'Tell us how your team works and what you need.',
      identity: 'Business contact',
      needs: 'Project needs',
      confirmation: 'Confirmation',
      required: '* Required',
      account: 'Business name',
      contact: 'Contact phone',
      mobilePlaceholder: 'Mobile number',
      email: 'Contact email',
      gender: 'Business type',
      male: 'Company',
      female: 'Individual',
      interests: 'Service needs',
      design: 'Product design',
      develop: 'Development',
      quantity: 'Team size',
      score: 'Collaboration interest',
      budget: 'Budget ratio',
      budgetHint: 'Adjust in steps of 10%, from 0% to 100%.',
      password: 'Confirm PIN',
      passwordHint: 'Enter six digits. Your PIN remains masked.',
      remark: 'Project notes',
      qualification: 'Supporting files',
      chooseFiles: 'Choose files',
      choosingFiles: 'Choosing files',
      retryFiles: 'Try again',
      removeFile: 'Remove',
      filesHint: 'Select the supporting documents to include with your brief.',
      fileSelectionFailed: 'File selection failed',
      save: 'Save',
      saveSuccess: 'Saved',
      saveFailed: 'Save failed',
      missingResult: 'No validation result was received.',
      company: 'Company',
      companyName: 'Company Name',
      companyContact: 'Contact',
      companyPhone: 'Phone',
      companyType: 'Type',
      primaryCompany: 'Primary',
      setPrimaryCompany: 'Set Primary',
      headOffice: 'Head Office',
      branchOffice: 'Branch',
      addCompany: 'Add Company',
      removeCompany: 'Remove',
      companyCountSuffix: 'items',
      companyNameError: 'Use at least 2 characters',
      companyContactError: 'Enter a contact name',
      companyPhoneError: 'Enter an 11-digit phone number',
      companyTypeError: 'Select a company type',
      companyCountError: 'Add at least one company',
      disclosure: 'Details',
      toggleDetails: 'Toggle details',
      detailsBody: 'Hidden content becomes visible when open.',
      accordion: 'Accordion',
      multiplePanels: 'Multiple panels',
      one: 'One',
      two: 'Two',
      bodyOne: 'Body one',
      bodyTwo: 'Body two',
    }
  : {
      disabled: '禁用',
      readonly: '只读',
      states: '禁用与只读状态',
      notifyTitle: '通知方式',
      notifyHint: '最多选择两种',
      notifyWeChat: '微信通知',
      notifySms: '短信',
      notifyEmail: '邮件',
      selected: '已选择',
      paymentTitle: '支付方式',
      paymentHint: '订单 #1042 · 安全收银台',
      wechatPay: '微信支付',
      alipay: '支付宝',
      cardPay: '银行卡',
      recommended: '推荐',
      orderAmount: '应付 · ¥299',
      warehouseTitle: '默认发货仓',
      warehouseHint: '影响库存分配与配送费用',
      warehouseSelected: '当前仓库',
      selectPlaceholder: '请选择城市',
      none: '未选择',
      multipleTitle: '发货仓库',
      multipleHint: '可选择多个仓库，每次选择立即生效。',
      searchTitle: '查找发货仓',
      searchHint: '输入城市名称筛选可用仓库。',
      notificationTitle: '通知设置',
      notificationHint: '选择允许打扰你的消息类型',
      marketingNotice: '产品与活动通知',
      marketingNoticeDesc: '偶尔推送功能更新与优惠活动',
      orderNotice: '订单状态通知',
      orderNoticeDesc: '履约进度必需，无法关闭',
      switchOn: '已开启',
      switchOff: '已关闭',
      readonlyNotice: '通知偏好',
      readonlyNoticeDesc: '查看已保存的通知设置',
      reviewTitle: '服务评分',
      reviewHint: '订单 #1042 · 今日已送达',
      reviewScore: '你的评分',
      savedRating: '已保存的评分',
      unavailableRating: '暂不可评分',
      formTitle: '提交合作需求',
      formHint: '完善联系人、项目方向和预算信息。',
      identity: '商户联系信息',
      needs: '项目需求',
      confirmation: '确认与附件',
      required: '* 必填',
      account: '商户名称',
      contact: '联系人手机',
      mobilePlaceholder: '请输入手机号',
      email: '联系邮箱',
      gender: '主体类型',
      male: '企业',
      female: '个人',
      interests: '服务需求',
      design: '产品设计',
      develop: '研发交付',
      quantity: '团队规模',
      score: '合作意愿',
      budget: '预算比例',
      budgetHint: '每次调整 10%，可选范围为 0%–100%。',
      password: '确认密码',
      passwordHint: '请输入 6 位数字，密码保持掩码显示。',
      remark: '项目备注',
      qualification: '资质文件',
      chooseFiles: '选择文件',
      choosingFiles: '正在选择文件',
      retryFiles: '重试',
      removeFile: '移除',
      filesHint: '选择随合作需求提交的资质材料。',
      fileSelectionFailed: '选择文件失败',
      save: '保存',
      saveSuccess: '保存成功',
      saveFailed: '保存失败',
      missingResult: '未收到校验结果。',
      company: '公司',
      companyName: '公司名称',
      companyContact: '联系人',
      companyPhone: '联系电话',
      companyType: '公司类型',
      primaryCompany: '主公司',
      setPrimaryCompany: '设为主公司',
      headOffice: '总部',
      branchOffice: '分部',
      addCompany: '新增公司',
      removeCompany: '删除',
      companyCountSuffix: '项',
      companyNameError: '公司名称至少 2 个字符',
      companyContactError: '请输入联系人',
      companyPhoneError: '请输入 11 位手机号',
      companyTypeError: '请选择公司类型',
      companyCountError: '请至少添加一家公司',
      disclosure: '详细信息',
      toggleDetails: '展开或收起详情',
      detailsBody: '展开后可以看到隐藏的内容。',
      accordion: '手风琴',
      multiplePanels: '展开多个面板',
      one: '第一项',
      two: '第二项',
      bodyOne: '第一项内容',
      bodyTwo: '第二项内容',
    })

const checkboxValue = shallowRef<Array<string | number | boolean>>(['wechat'])
const radioValue = shallowRef<string | number>('wechat')
const selectValue = shallowRef<string | number | undefined>('hangzhou')
const multipleValue = shallowRef<Array<string | number>>(['hangzhou'])
const searchValue = shallowRef<string | number | undefined>('hangzhou')
const switchValue = shallowRef(true)
const rateValue = shallowRef(3)
const accordionValue = shallowRef<string | string[] | undefined>('one')
const disclosureValue = shallowRef<string | string[] | undefined>('')
const multiplePanels = shallowRef<string | string[] | undefined>(['one'])
const disabledChannels = ['wechat']
const paymentMethodLabel = computed(() => {
  const labels: Record<string, string> = { wechat: copy.value.wechatPay, alipay: copy.value.alipay, card: copy.value.cardPay }
  return labels[String(radioValue.value)]
})
const selectOptions = computed(() => en.value
  ? [
      { label: 'Shanghai center', value: 'shanghai' },
      { label: 'Hangzhou center', value: 'hangzhou' },
      { label: 'Shenzhen center', value: 'shenzhen' },
    ]
  : [
      { label: '上海仓', value: 'shanghai' },
      { label: '杭州仓', value: 'hangzhou' },
      { label: '深圳仓', value: 'shenzhen' },
    ])
const searchOptions = computed(() => selectOptions.value.map(option => ({ ...option, disabled: option.value === 'shenzhen' })))
const selectOptionLabel = computed(() => selectOptions.value.find(option => option.value === selectValue.value)?.label || copy.value.none)
const searchOptionLabel = computed(() => selectOptions.value.find(option => option.value === searchValue.value)?.label || copy.value.none)
const multipleLabels = computed(() => selectOptions.value.filter(option => multipleValue.value.includes(option.value)).map(option => option.label).join(', ') || copy.value.none)
const switchLabel = computed(() => switchValue.value ? copy.value.switchOn : copy.value.switchOff)
const rateFeedback = computed(() => {
  const labels = en.value ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'] : ['', '很差', '一般', '不错', '满意', '超出预期']
  return labels[rateValue.value]
})

function selectCenter(value: string | number | Array<string | number> | undefined) {
  selectValue.value = Array.isArray(value) ? value[0] : value
}
function selectSearchCenter(value: string | number | Array<string | number> | undefined) {
  searchValue.value = Array.isArray(value) ? value[0] : value
}
function selectCenters(value: string | number | Array<string | number> | undefined) {
  multipleValue.value = Array.isArray(value) ? value : []
}

interface NativeFormHandle {
  form: UseFormReturn
  validateField: UseFormReturn['validateField']
}
const briefFormRef = useTemplateRef<NativeFormHandle>('briefForm')
const arrayFormRef = useTemplateRef<NativeFormHandle>('arrayForm')

async function validateFormField(name: string, trigger: 'change' | 'blur', array = false) {
  await nextTick()
  const target = (array ? arrayFormRef.value : briefFormRef.value)!
  if (trigger === 'blur') { target.form.setFieldTouched(name, true) }
  if (target.form.shouldValidateField(name, trigger)) {
    await target.validateField(name, trigger)
  }
}

const formModel = reactive({
  account: '',
  budget: 40,
  contact: '',
  email: '',
  files: [] as WechatMiniprogram.ChooseFile[],
  gender: '',
  interests: [] as Array<string | number | boolean>,
  password: '',
  quantity: 1,
  remark: '',
  score: 0,
})
function updateFormModel(values: FormValues) {
  Object.assign(formModel, values)
}
async function updateFormField<K extends keyof typeof formModel>(name: K, value: (typeof formModel)[K]) {
  formModel[name] = value
  await validateFormField(name, 'change')
}
const pickingFiles = shallowRef(false)
const filePickerError = shallowRef('')
const filePickerLabel = computed(() => filePickerError.value ? copy.value.retryFiles : copy.value.chooseFiles)

async function chooseSupportingFiles() {
  if (pickingFiles.value) { return }
  pickingFiles.value = true
  filePickerError.value = ''
  try {
    const files = await new Promise<WechatMiniprogram.ChooseFile[]>((resolve, reject) => {
      wx.chooseMessageFile({
        count: 9,
        type: 'all',
        success: result => resolve(result.tempFiles),
        fail: reject,
      })
    })
    formModel.files = [...formModel.files, ...files]
    formResult.value = 'idle'
    formErrors.value = []
  }
  catch (error) {
    filePickerError.value = typeof error === 'object' && error !== null && 'errMsg' in error
      ? String(error.errMsg)
      : String(error)
  }
  finally {
    pickingFiles.value = false
  }
  if (!filePickerError.value) { await validateFormField('files', 'change') }
}

async function removeSupportingFile(index: number) {
  formModel.files = formModel.files.filter((_, current) => current !== index)
  formResult.value = 'idle'
  formErrors.value = []
  await validateFormField('files', 'change')
}

const requiredLabels = computed(() => ({
  account: `${copy.value.account} *`,
  contact: `${copy.value.contact} *`,
  email: `${copy.value.email} *`,
  gender: `${copy.value.gender} *`,
  interests: `${copy.value.interests} *`,
  score: `${copy.value.score} *`,
  budget: `${copy.value.budget} *`,
  password: `${copy.value.password} *`,
  remark: `${copy.value.remark} *`,
  qualification: `${copy.value.qualification} *`,
}))
const formRules = computed<FormRules>(() => {
  const required = (label: string) => (value: unknown) => {
    const filled = Array.isArray(value) ? value.length > 0 : String(value ?? '').trim().length > 0
    return filled || (en.value ? `${label} is required` : `请填写${label}`)
  }
  const minimum = (limit: number, label: string) => (value: unknown) =>
    Number(value) >= limit || (en.value ? `${label} must be at least ${limit}` : `${label}至少为 ${limit}`)
  return {
    account: [
      { validator: required(copy.value.account), trigger: 'change' },
      { validator: value => !value || String(value).length >= 3 || (en.value ? 'Use at least 3 characters' : '商户名称至少 3 个字符'), trigger: 'change' },
    ],
    budget: { validator: minimum(50, copy.value.budget), trigger: 'change' },
    contact: [
      { validator: required(copy.value.contact), trigger: ['change', 'blur'] },
      { validator: value => !value || String(value).length === 11 || copy.value.companyPhoneError, trigger: 'blur' },
    ],
    email: [
      { validator: required(copy.value.email), trigger: ['change', 'blur'] },
      { validator: value => !value || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(String(value)) || (en.value ? 'Enter a valid email address' : '请输入有效邮箱'), trigger: 'blur' },
    ],
    files: { validator: required(copy.value.qualification), trigger: 'change' },
    gender: { validator: required(copy.value.gender), trigger: 'change' },
    interests: { validator: required(copy.value.interests), trigger: 'change' },
    password: [
      { validator: required(copy.value.password), trigger: 'change' },
      { validator: value => !value || String(value).length === 6 || (en.value ? 'Enter a 6-digit PIN' : '请输入 6 位确认密码'), trigger: 'change' },
    ],
    quantity: { validator: minimum(2, copy.value.quantity), trigger: 'change' },
    remark: [
      { validator: required(copy.value.remark), trigger: ['change', 'blur'] },
      { validator: value => String(value ?? '').length <= 80 || (en.value ? 'Use no more than 80 characters' : '项目备注最多 80 个字符'), trigger: 'blur' },
    ],
    score: { validator: minimum(1, copy.value.score), trigger: 'change' },
  }
})

interface Company { name: string, contact: string, phone: string, type: string }
const formArrayModel = reactive({ companies: [{ name: '', contact: '', phone: '', type: '' }] as Company[] })
function updateFormArrayModel(values: FormValues) {
  Object.assign(formArrayModel, values)
}
async function updateCompanyField(index: number, name: keyof Company, value: string) {
  formArrayModel.companies[index]![name] = value
  await validateFormField(`companies.${index}.${name}`, 'change', true)
}
const primaryCompanyIndex = shallowRef(0)
const companyRows = computed(() => formArrayModel.companies.map((_, index) => ({
  index,
  title: `${copy.value.company} ${index + 1}`,
  namePath: `companies.${index}.name`,
  nameLabel: `${copy.value.company} ${index + 1} ${copy.value.companyName} *`,
  contactPath: `companies.${index}.contact`,
  contactLabel: `${copy.value.company} ${index + 1} ${copy.value.companyContact} *`,
  phonePath: `companies.${index}.phone`,
  phoneLabel: `${copy.value.company} ${index + 1} ${copy.value.companyPhone} *`,
  typePath: `companies.${index}.type`,
  typeLabel: `${copy.value.company} ${index + 1} ${copy.value.companyType} *`,
})))
const formArraySchema = computed<StandardSchemaV1<FormValues>>(() => ({
  '~standard': {
    version: 1,
    vendor: 'varo-docs',
    async validate(value: unknown) {
      const companies = (value as { companies?: unknown })?.companies
      const issues: StandardSchemaIssue[] = []
      if (!Array.isArray(companies) || companies.length === 0) {
        return { issues: [{ message: copy.value.companyCountError, path: ['companies'] }] }
      }
      companies.forEach((company: Company, index) => {
        if (typeof company.name !== 'string' || company.name.length < 2) {
          issues.push({ message: copy.value.companyNameError, path: ['companies', index, 'name'] })
        }
        if (typeof company.contact !== 'string' || company.contact.length < 1) {
          issues.push({ message: copy.value.companyContactError, path: ['companies', index, 'contact'] })
        }
        if (typeof company.phone !== 'string' || !/^\d{11}$/.test(company.phone)) {
          issues.push({ message: copy.value.companyPhoneError, path: ['companies', index, 'phone'] })
        }
        if (typeof company.type !== 'string' || company.type.length < 1) {
          issues.push({ message: copy.value.companyTypeError, path: ['companies', index, 'type'] })
        }
      })
      return issues.length ? { issues } : { value: value as FormValues }
    },
  },
}))
const formResult = shallowRef<'idle' | 'success' | 'failed'>('idle')
const formErrors = shallowRef<string[]>([])
const arrayResult = shallowRef<'idle' | 'success' | 'failed'>('idle')
const arrayErrors = shallowRef<string[]>([])
const formStatus = computed(() => formResult.value === 'idle' ? '' : formResult.value === 'success' ? copy.value.saveSuccess : copy.value.saveFailed)
const arrayStatus = computed(() => arrayResult.value === 'idle' ? '' : arrayResult.value === 'success' ? copy.value.saveSuccess : copy.value.saveFailed)
type NativeSubmitPayload = SubmitPayload | [SubmitPayload] | undefined
function receiveResult(payload: NativeSubmitPayload, array: boolean) {
  const result = Array.isArray(payload) ? payload[0] : payload
  const errors = result ? Object.values(result.errors) : [copy.value.missingResult]
  const valid = Boolean(result) && errors.length === 0
  if (array) {
    arrayErrors.value = errors
    arrayResult.value = valid ? 'success' : 'failed'
  }
  else {
    formErrors.value = errors
    formResult.value = valid ? 'success' : 'failed'
  }
}
function onFormResult(payload: NativeSubmitPayload) {
  receiveResult(payload, false)
}
function onArrayResult(payload: NativeSubmitPayload) {
  receiveResult(payload, true)
}
function addCompany() {
  formArrayModel.companies = [...formArrayModel.companies, { name: '', contact: '', phone: '', type: '' }]
  arrayResult.value = 'idle'
  arrayErrors.value = []
}
function removeCompany(index: number) {
  if (formArrayModel.companies.length === 1) { return }
  formArrayModel.companies = formArrayModel.companies.filter((_, current) => current !== index)
  if (primaryCompanyIndex.value > index) { primaryCompanyIndex.value -= 1 }
  else if (primaryCompanyIndex.value >= formArrayModel.companies.length) { primaryCompanyIndex.value = formArrayModel.companies.length - 1 }
  arrayResult.value = 'idle'
  arrayErrors.value = []
}
</script>

<template>
  <DocsDemoPage :component="component" :theme="theme">
    <template v-if="component === 'checkbox'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="notification-channels">
        <view class="docs-demo__stack">
          <text class="docs-demo__heading">
            {{ copy.notifyTitle }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.notifyHint }}
          </text>
          <text class="docs-demo__value" role="status">
            {{ copy.selected }} {{ checkboxValue.length }}/2
          </text>
        </view>
        <VCheckboxGroup v-model:value="checkboxValue" direction="horizontal" :max="2">
          <VCheckbox :label="copy.notifyWeChat" value="wechat" />
          <VCheckbox :label="copy.notifySms" value="sms" />
          <VCheckbox :label="copy.notifyEmail" value="email" />
        </VCheckboxGroup>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="checkbox-states">
        <text class="docs-demo__heading">
          {{ copy.states }}
        </text>
        <VCheckboxGroup :value="disabledChannels" direction="horizontal" disabled>
          <VCheckbox :label="copy.notifyWeChat" value="wechat" />
          <VCheckbox :label="copy.notifySms" value="sms" />
        </VCheckboxGroup>
        <VCheckbox :checked="true" readonly :label="copy.readonly" />
      </view>
    </template>

    <template v-else-if="component === 'radio'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="payment-method">
        <text class="docs-demo__heading">
          {{ copy.paymentTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.paymentHint }}
        </text>
        <text class="docs-demo__value">
          {{ copy.orderAmount }}
        </text>
        <VRadioGroup v-model:value="radioValue" direction="horizontal">
          <VRadio value="wechat">
            <text>{{ copy.wechatPay }}</text>
            <text class="docs-demo__muted">
              · {{ copy.recommended }}
            </text>
          </VRadio>
          <VRadio :label="copy.alipay" value="alipay" />
          <VRadio :label="copy.cardPay" value="card" />
        </VRadioGroup>
        <text class="docs-demo__value" role="status">
          {{ copy.selected }}：{{ paymentMethodLabel }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="radio-disabled-group">
        <text class="docs-demo__heading">
          {{ copy.disabled }}
        </text>
        <VRadioGroup value="wechat" direction="horizontal" disabled>
          <VRadio :label="copy.wechatPay" value="wechat" />
          <VRadio :label="copy.alipay" value="alipay" />
          <VRadio :label="copy.cardPay" value="card" />
        </VRadioGroup>
      </view>
    </template>

    <template v-else-if="component === 'select'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="default-fulfillment-center">
        <text class="docs-demo__heading">
          {{ copy.warehouseTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.warehouseHint }}
        </text>
        <VSelect :value="selectValue" :options="selectOptions" :placeholder="copy.selectPlaceholder" clearable @update:value="selectCenter" />
        <text class="docs-demo__value" role="status">
          {{ copy.warehouseSelected }}：{{ selectOptionLabel }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="select-multiple">
        <text class="docs-demo__heading">
          {{ copy.multipleTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.multipleHint }}
        </text>
        <VSelect :value="multipleValue" :options="selectOptions" :placeholder="copy.selectPlaceholder" multiple clearable @update:value="selectCenters" />
        <text class="docs-demo__value" role="status">
          {{ copy.selected }}：{{ multipleLabels }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="select-search">
        <text class="docs-demo__heading">
          {{ copy.searchTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.searchHint }}
        </text>
        <VSelect :value="searchValue" :options="searchOptions" :placeholder="copy.selectPlaceholder" filterable clearable @update:value="selectSearchCenter" />
        <text class="docs-demo__value" role="status">
          {{ copy.selected }}：{{ searchOptionLabel }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="select-states">
        <text class="docs-demo__heading">
          {{ copy.states }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.readonly }}
        </text>
        <VSelect value="hangzhou" :options="selectOptions" readonly filterable clearable />
        <text class="docs-demo__muted">
          {{ copy.disabled }}
        </text>
        <VSelect value="hangzhou" :options="selectOptions" disabled />
      </view>
    </template>

    <template v-else-if="component === 'switch'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="notification-settings">
        <text class="docs-demo__heading">
          {{ copy.notificationTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.notificationHint }}
        </text>
        <text class="docs-demo__value" role="status">
          {{ switchLabel }}
        </text>
        <view class="flex items-center justify-between gap-4">
          <view class="min-w-0 flex-1">
            <text class="block font-semibold">
              {{ copy.marketingNotice }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.marketingNoticeDesc }}
            </text>
          </view>
          <VSwitch v-model="switchValue" :aria-label="copy.marketingNotice" />
        </view>
        <view class="flex items-center justify-between gap-4">
          <view class="min-w-0 flex-1">
            <text class="block font-semibold">
              {{ copy.orderNotice }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.orderNoticeDesc }}
            </text>
          </view>
          <VSwitch :model-value="true" :aria-label="copy.orderNotice" disabled />
        </view>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="switch-readonly">
        <text class="docs-demo__heading">
          {{ copy.readonly }}
        </text>
        <view class="flex items-center justify-between gap-4">
          <view class="min-w-0 flex-1">
            <text class="block font-semibold">
              {{ copy.readonlyNotice }}
            </text>
            <text class="docs-demo__muted">
              {{ copy.readonlyNoticeDesc }}
            </text>
          </view>
          <VSwitch :model-value="true" :aria-label="copy.readonlyNotice" readonly />
        </view>
      </view>
    </template>

    <template v-else-if="component === 'rate'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="service-rating">
        <text class="docs-demo__heading">
          {{ copy.reviewTitle }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.reviewHint }}
        </text>
        <text class="docs-demo__value">
          {{ copy.reviewScore }} {{ rateValue }}/5
        </text>
        <VRate v-model:value="rateValue" />
        <text class="docs-demo__value" role="status">
          {{ rateFeedback }}
        </text>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="rate-states">
        <text class="docs-demo__heading">
          {{ copy.states }}
        </text>
        <text class="docs-demo__muted">
          {{ copy.savedRating }}
        </text>
        <VRate :value="4" readonly />
        <text class="docs-demo__muted">
          {{ copy.unavailableRating }}
        </text>
        <VRate :value="3" disabled />
      </view>
    </template>

    <template v-else-if="component === 'form'">
      <VForm ref="briefForm" :model="formModel" :rules="formRules" @update:model="updateFormModel" @submit="onFormResult" @failed="onFormResult">
        <view class="docs-demo__section docs-demo__stack" data-docs-case="project-brief">
          <text class="docs-demo__heading">
            {{ copy.formTitle }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.formHint }}
          </text>
          <text class="docs-demo__muted">
            {{ copy.required }}
          </text>
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="business-contact">
          <text class="docs-demo__heading">
            {{ copy.identity }}
          </text>
          <VFormItem name="account" :label="requiredLabels.account">
            <VInput :value="formModel.account" :placeholder="copy.account" clearable clear-trigger="always" @update:value="updateFormField('account', $event)" @blur="validateFormField('account', 'blur')" />
          </VFormItem>
          <VFormItem name="contact" :label="requiredLabels.contact">
            <VInput :value="formModel.contact" :placeholder="copy.mobilePlaceholder" type="tel" clearable clear-trigger="always" @update:value="updateFormField('contact', $event)" @blur="validateFormField('contact', 'blur')" />
          </VFormItem>
          <VFormItem name="email" :label="requiredLabels.email">
            <VInput :value="formModel.email" placeholder="name@example.com" clearable clear-trigger="always" @update:value="updateFormField('email', $event)" @blur="validateFormField('email', 'blur')" />
          </VFormItem>
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="project-needs">
          <text class="docs-demo__heading">
            {{ copy.needs }}
          </text>
          <VFormItem name="gender" :label="requiredLabels.gender">
            <VRadioGroup :value="formModel.gender" direction="horizontal" @update:value="updateFormField('gender', String($event))">
              <VRadio :label="copy.male" value="male" />
              <VRadio :label="copy.female" value="female" />
            </VRadioGroup>
          </VFormItem>
          <VFormItem name="interests" :label="requiredLabels.interests">
            <VCheckboxGroup :value="formModel.interests" direction="horizontal" @update:value="updateFormField('interests', $event)">
              <VCheckbox :label="copy.design" value="design" />
              <VCheckbox :label="copy.develop" value="develop" />
            </VCheckboxGroup>
          </VFormItem>
          <VFormItem name="quantity" :label="copy.quantity">
            <VInputNumber :value="formModel.quantity" :min="1" :max="9" :input-aria-label="copy.quantity" @update:value="updateFormField('quantity', $event)" />
          </VFormItem>
          <VFormItem name="score" :label="requiredLabels.score">
            <VRate :value="formModel.score" @update:value="updateFormField('score', $event)" />
          </VFormItem>
          <VFormItem name="budget" :label="requiredLabels.budget" :description="copy.budgetHint">
            <view class="docs-demo__row">
              <VInputNumber :value="formModel.budget" :min="0" :max="100" :step="10" :input-aria-label="copy.budget" @update:value="updateFormField('budget', $event)" />
              <text>{{ formModel.budget }}%</text>
            </view>
          </VFormItem>
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="confirmation-files">
          <text class="docs-demo__heading">
            {{ copy.confirmation }}
          </text>
          <VFormItem name="password" :label="requiredLabels.password" :description="copy.passwordHint">
            <VInputOtp :value="formModel.password" :length="6" :input-aria-label="copy.password" size="sm" mask @update:value="updateFormField('password', $event)" />
          </VFormItem>
          <VFormItem name="remark" :label="requiredLabels.remark">
            <VTextarea :value="formModel.remark" :aria-label="copy.remark" :max-length="80" :rows="3" show-word-limit @update:value="updateFormField('remark', $event)" @blur="validateFormField('remark', 'blur')" />
          </VFormItem>
          <VFormItem name="files" :label="requiredLabels.qualification" :description="copy.filesHint">
            <view class="docs-demo__stack" data-docs-case="supporting-files">
              <VButton variant="outline" tone="default" :loading="pickingFiles" :loading-text="copy.choosingFiles" @click="chooseSupportingFiles">
                {{ filePickerLabel }}
              </VButton>
              <view v-for="(file, index) in formModel.files" :key="index" class="flex items-center justify-between gap-3" :data-file-index="index">
                <text class="min-w-0 flex-1 break-all">
                  {{ file.name }}
                </text>
                <VButton size="sm" variant="text" tone="danger" @click="removeSupportingFile(index)">
                  {{ copy.removeFile }}
                </VButton>
              </view>
              <view v-if="filePickerError" class="docs-demo__stack" role="alert">
                <text>{{ copy.fileSelectionFailed }}</text>
                <text class="docs-demo__muted break-all">
                  {{ filePickerError }}
                </text>
              </view>
            </view>
          </VFormItem>
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="project-submit">
          <VButton native-type="submit" block>
            {{ copy.save }}
          </VButton>
          <view v-if="formStatus" class="docs-demo__stack" role="status" aria-live="polite">
            <text class="docs-demo__value">
              {{ formStatus }}
            </text>
            <text v-for="error in formErrors" :key="error" class="docs-demo__muted">
              {{ error }}
            </text>
          </view>
        </view>
      </VForm>
    </template>

    <template v-else-if="component === 'form-array'">
      <view class="docs-demo__section docs-demo__row" data-docs-case="company-toolbar">
        <text class="docs-demo__value">
          {{ formArrayModel.companies.length }} {{ copy.companyCountSuffix }}
        </text>
        <VButton variant="outline" size="sm" @click="addCompany">
          {{ copy.addCompany }}
        </VButton>
      </view>
      <VForm ref="arrayForm" :model="formArrayModel" :validation-schema="formArraySchema" @update:model="updateFormArrayModel" @submit="onArrayResult" @failed="onArrayResult">
        <view v-for="row in companyRows" :key="row.index" class="docs-demo__section docs-demo__stack" data-docs-case="company-row" :data-company-index="row.index">
          <view class="docs-demo__row">
            <text class="docs-demo__heading">
              {{ row.title }}
            </text>
            <text v-if="primaryCompanyIndex === row.index" class="docs-demo__value">
              {{ copy.primaryCompany }}
            </text>
            <VButton v-else size="sm" variant="text" @click="primaryCompanyIndex = row.index">
              {{ copy.setPrimaryCompany }}
            </VButton>
            <VButton v-if="formArrayModel.companies.length > 1" size="sm" variant="text" tone="danger" @click="removeCompany(row.index)">
              {{ copy.removeCompany }}
            </VButton>
          </view>
          <VFormItem :name="row.namePath" :label="row.nameLabel">
            <VInput :value="formArrayModel.companies[row.index].name" :placeholder="copy.companyName" clearable clear-trigger="always" @update:value="updateCompanyField(row.index, 'name', $event)" />
          </VFormItem>
          <VFormItem :name="row.contactPath" :label="row.contactLabel">
            <VInput :value="formArrayModel.companies[row.index].contact" :placeholder="copy.companyContact" clearable clear-trigger="always" @update:value="updateCompanyField(row.index, 'contact', $event)" />
          </VFormItem>
          <VFormItem :name="row.phonePath" :label="row.phoneLabel">
            <VInput :value="formArrayModel.companies[row.index].phone" :placeholder="copy.mobilePlaceholder" type="tel" clearable clear-trigger="always" @update:value="updateCompanyField(row.index, 'phone', $event)" @blur="validateFormField(row.phonePath, 'blur', true)" />
          </VFormItem>
          <VFormItem :name="row.typePath" :label="row.typeLabel">
            <VRadioGroup :value="formArrayModel.companies[row.index].type" direction="horizontal" @update:value="updateCompanyField(row.index, 'type', String($event))">
              <VRadio :label="copy.headOffice" value="head" />
              <VRadio :label="copy.branchOffice" value="branch" />
            </VRadioGroup>
          </VFormItem>
        </view>
        <view class="docs-demo__section docs-demo__stack" data-docs-case="company-submit">
          <VButton native-type="submit" block>
            {{ copy.save }}
          </VButton>
          <view v-if="arrayStatus" class="docs-demo__stack" role="status" aria-live="polite">
            <text class="docs-demo__value">
              {{ arrayStatus }}
            </text>
            <text v-for="(error, index) in arrayErrors" :key="index" class="docs-demo__muted">
              {{ error }}
            </text>
          </view>
        </view>
      </VForm>
    </template>

    <template v-else-if="component === 'collapse'">
      <view class="docs-demo__section docs-demo__stack" data-docs-case="disclosure">
        <text class="docs-demo__heading">
          {{ copy.disclosure }}
        </text>
        <VCollapse v-model:value="disclosureValue" accordion collapsible>
          <VCollapseItem value="details" :title="copy.toggleDetails">
            {{ copy.detailsBody }}
          </VCollapseItem>
        </VCollapse>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="accordion">
        <text class="docs-demo__heading">
          {{ copy.accordion }}
        </text>
        <VCollapse v-model:value="accordionValue" accordion collapsible>
          <VCollapseItem value="one" :title="copy.one">
            {{ copy.bodyOne }}
          </VCollapseItem>
          <VCollapseItem value="two" :title="copy.two">
            {{ copy.bodyTwo }}
          </VCollapseItem>
          <VCollapseItem value="disabled" :title="copy.disabled" disabled>
            {{ copy.disabled }}
          </VCollapseItem>
        </VCollapse>
      </view>
      <view class="docs-demo__section docs-demo__stack" data-docs-case="multiple-panels">
        <text class="docs-demo__heading">
          {{ copy.multiplePanels }}
        </text>
        <VCollapse v-model:value="multiplePanels">
          <VCollapseItem value="one" :title="copy.one">
            {{ copy.bodyOne }}
          </VCollapseItem>
          <VCollapseItem value="two" :title="copy.two">
            {{ copy.bodyTwo }}
          </VCollapseItem>
        </VCollapse>
      </view>
    </template>
  </DocsDemoPage>
</template>

<component lang="json">
{
  "options": { "styleIsolation": "apply-shared" }
}
</component>
