<script setup lang="ts">
import {
  VButton as H5Button,
  VCalendar as H5Calendar,
  VCalendarCard as H5CalendarCard,
  VCascader as H5Cascader,
  VCheckbox as H5Checkbox,
  VCheckboxGroup as H5CheckboxGroup,
  VDatePicker as H5DatePicker,
  VForm as H5Form,
  VFormItem as H5FormItem,
  VInput as H5Input,
  VInputNumber as H5InputNumber,
  VLoading as H5Loading,
  VNumberKeyboard as H5NumberKeyboard,
  VPicker as H5Picker,
  VRadio as H5Radio,
  VRadioGroup as H5RadioGroup,
  VRange as H5Range,
  VRate as H5Rate,
  VSearchbar as H5Searchbar,
  VSelect as H5Select,
  VShortPassword as H5ShortPassword,
  VSkeleton as H5Skeleton,
  VSwitch as H5Switch,
  VTextarea as H5Textarea,
  VToast as H5Toast,
  VUploader as H5Uploader,
} from '@varo-ui/h5'
import {
  VButton as WeappButton,
  VCalendar as WeappCalendar,
  VCalendarCard as WeappCalendarCard,
  VCascader as WeappCascader,
  VCheckbox as WeappCheckbox,
  VCheckboxGroup as WeappCheckboxGroup,
  VDatePicker as WeappDatePicker,
  VForm as WeappForm,
  VFormItem as WeappFormItem,
  VInput as WeappInput,
  VInputNumber as WeappInputNumber,
  VLoading as WeappLoading,
  VNumberKeyboard as WeappNumberKeyboard,
  VPicker as WeappPicker,
  VRadio as WeappRadio,
  VRadioGroup as WeappRadioGroup,
  VRange as WeappRange,
  VRate as WeappRate,
  VSearchbar as WeappSearchbar,
  VSelect as WeappSelect,
  VShortPassword as WeappShortPassword,
  VSkeleton as WeappSkeleton,
  VSwitch as WeappSwitch,
  VTextarea as WeappTextarea,
  VToast as WeappToast,
  VUploader as WeappUploader,
} from '@varo-ui/weapp'
import { computed, onBeforeUnmount, reactive, ref, shallowRef, useId } from 'vue'
import { z } from 'zod'

type FormDemoKind
  = | 'calendar'
    | 'calendar-card'
    | 'cascader'
    | 'checkbox'
    | 'date-picker'
    | 'form'
    | 'form-array'
    | 'input-number'
    | 'loading'
    | 'number-keyboard'
    | 'picker'
    | 'radio'
    | 'range'
    | 'rate'
    | 'searchbar'
    | 'select'
    | 'skeleton'
    | 'short-password'
    | 'switch'
    | 'textarea'
    | 'toast'
    | 'uploader'
type Locale = 'zh' | 'en'
type Platform = 'h5' | 'weapp'

const props = withDefaults(
  defineProps<{
    example: FormDemoKind
    locale?: Locale
  }>(),
  {
    locale: 'zh',
  },
)

const codeExpanded = ref(false)
const activePlatform = ref<Platform>('h5')
const VButton = computed(() => activePlatform.value === 'h5' ? H5Button : WeappButton)
const VCalendar = computed(() => activePlatform.value === 'h5' ? H5Calendar : WeappCalendar)
const VCalendarCard = computed(() => activePlatform.value === 'h5' ? H5CalendarCard : WeappCalendarCard)
const VCascader = computed(() => activePlatform.value === 'h5' ? H5Cascader : WeappCascader)
const VCheckbox = computed(() => activePlatform.value === 'h5' ? H5Checkbox : WeappCheckbox)
const VCheckboxGroup = computed(() => activePlatform.value === 'h5' ? H5CheckboxGroup : WeappCheckboxGroup)
const VDatePicker = computed(() => activePlatform.value === 'h5' ? H5DatePicker : WeappDatePicker)
const VForm = computed(() => activePlatform.value === 'h5' ? H5Form : WeappForm)
const VFormItem = computed(() => activePlatform.value === 'h5' ? H5FormItem : WeappFormItem)
const VInput = computed(() => activePlatform.value === 'h5' ? H5Input : WeappInput)
const VInputNumber = computed(() => activePlatform.value === 'h5' ? H5InputNumber : WeappInputNumber)
const VLoading = computed(() => activePlatform.value === 'h5' ? H5Loading : WeappLoading)
const VNumberKeyboard = computed(() => activePlatform.value === 'h5' ? H5NumberKeyboard : WeappNumberKeyboard)
const VPicker = computed(() => activePlatform.value === 'h5' ? H5Picker : WeappPicker)
const VRadio = computed(() => activePlatform.value === 'h5' ? H5Radio : WeappRadio)
const VRadioGroup = computed(() => activePlatform.value === 'h5' ? H5RadioGroup : WeappRadioGroup)
const VRange = computed(() => activePlatform.value === 'h5' ? H5Range : WeappRange)
const VRate = computed(() => activePlatform.value === 'h5' ? H5Rate : WeappRate)
const VSearchbar = computed(() => activePlatform.value === 'h5' ? H5Searchbar : WeappSearchbar)
const VSelect = computed(() => activePlatform.value === 'h5' ? H5Select : WeappSelect)
const VSkeleton = computed(() => activePlatform.value === 'h5' ? H5Skeleton : WeappSkeleton)
const VShortPassword = computed(() => activePlatform.value === 'h5' ? H5ShortPassword : WeappShortPassword)
const VSwitch = computed(() => activePlatform.value === 'h5' ? H5Switch : WeappSwitch)
const VTextarea = computed(() => activePlatform.value === 'h5' ? H5Textarea : WeappTextarea)
const VToast = computed(() => activePlatform.value === 'h5' ? H5Toast : WeappToast)
const VUploader = computed(() => activePlatform.value === 'h5' ? H5Uploader : WeappUploader)
const copyState = ref<'idle' | 'copied' | 'unsupported'>('idle')
let copyFeedbackTimer: number | undefined
const checkboxValue = shallowRef(['wechat'])
const radioValue = shallowRef('wechat')
const selectValue = shallowRef<string | number>('hangzhou')
const switchValue = shallowRef(true)
const skeletonLoading = shallowRef(true)
const skeletonCase = shallowRef<'article' | 'image' | 'video'>('article')
const inputNumberValue = shallowRef(2)
const rateValue = shallowRef(3)
const rangeValue = shallowRef(40)
const searchValue = shallowRef('Form')
const componentSearchResults = computed(() => {
  const query = searchValue.value.trim().toLocaleLowerCase()
  if (!query) { return [] }
  return ['Form', 'FormItem', 'Input', 'Searchbar'].filter(name =>
    name.toLocaleLowerCase().includes(query),
  )
})
const textareaValue = shallowRef(props.locale === 'en' ? 'The confirmation button does not respond after selecting a date.' : '选择日期后点击确认按钮没有响应。')
const toastItems = computed(() => [
  { id: 'info', message: props.locale === 'en' ? 'Information updated' : '信息已更新', type: 'text' as const },
  { id: 'warning', message: props.locale === 'en' ? 'Check required fields' : '请检查必填项', type: 'warning' as const },
  { id: 'error', message: props.locale === 'en' ? 'Request failed' : '请求失败', type: 'danger' as const },
  { id: 'success', message: props.locale === 'en' ? 'Saved successfully' : '保存成功', type: 'success' as const },
])
const formModel = reactive({
  account: '',
  budget: 40,
  contact: '',
  email: '',
  files: [] as Array<{ name: string, status?: 'ready' | 'uploading' | 'done' | 'failed' }>,
  gender: '',
  interests: [] as string[],
  password: '',
  quantity: 1,
  remark: '',
  score: 0,
})
const formArrayModel = reactive({
  companies: [{ name: '', contact: '', phone: '', type: '' }],
})
const primaryCompanyIndex = ref(0)
const calendarValue = ref('2026-05-14')
const cascaderValue = ref<Array<string | number>>(['zhejiang'])
const cascaderConfirmed = shallowRef<string[]>([])
const pickerValue = shallowRef<string | number>('morning')
const pickerConfirmed = shallowRef('')
const shortPasswordValue = shallowRef('123')
const passwordComplete = computed(() => shortPasswordValue.value.length === 6)
const uploaderFiles = shallowRef([
  { name: 'business-license.jpg', progress: 100, status: 'done' as const },
  { name: 'brand-guide.pdf', progress: 64, status: 'uploading' as const },
])
const calendarVisible = ref(true)
const calendarConfirmed = shallowRef('')
const cascaderVisible = ref(true)
const datePickerVisible = ref(true)
const datePickerConfirmed = shallowRef('')
const numberKeyboardVisible = ref(true)
const keyboardAmount = shallowRef('128')
const keyboardConfirmed = shallowRef('')
const pickerVisible = ref(true)
const formStatus = ref('')
const formArrayStatus = ref('')
const formId = useId()
const formArrayId = useId()
const changeTrigger = 'change' as const
const blurTrigger = 'blur' as const
const formRules = {
  account: [
    { required: true, trigger: changeTrigger },
    { min: 3, trigger: changeTrigger },
  ],
  budget: { min: 50, trigger: changeTrigger },
  contact: [
    { required: true, trigger: [changeTrigger, blurTrigger] },
    { length: 11, trigger: blurTrigger },
  ],
  email: [
    { required: true, trigger: [changeTrigger, blurTrigger] },
    { email: true, trigger: blurTrigger },
  ],
  files: { required: true, trigger: changeTrigger },
  gender: { required: true, trigger: changeTrigger },
  interests: { required: true, trigger: changeTrigger },
  password: [
    { required: true, trigger: changeTrigger },
    { length: 6, trigger: changeTrigger },
  ],
  quantity: { min: 2, trigger: changeTrigger },
  remark: [
    { required: true, trigger: [changeTrigger, blurTrigger] },
    { max: 80, trigger: blurTrigger },
  ],
  score: { min: 1, trigger: changeTrigger },
}
const formArraySchema = computed(() => {
  const isEnglish = props.locale === 'en'
  return z.object({
    companies: z.array(
      z.object({
        contact: z.string().min(1, isEnglish ? 'Enter a contact name' : '请输入联系人'),
        name: z.string().min(2, isEnglish ? 'Use at least 2 characters' : '公司名称至少 2 个字符'),
        phone: z.string().regex(/^\d{11}$/, isEnglish ? 'Enter an 11-digit phone number' : '请输入 11 位手机号'),
        type: z.string().min(1, isEnglish ? 'Select a company type' : '请选择公司类型'),
      }),
    ).min(1, isEnglish ? 'Add at least one company' : '请至少添加一家公司'),
  })
})

const copy = computed(() =>
  props.locale === 'en'
    ? {
        preview: 'Live Preview',
        code: 'Example Code',
        codeExpand: 'Show code',
        codeCollapse: 'Hide code',
        copyCode: 'Copy code',
        copyCodeH5: 'Copy H5 code',
        copyCodeWeapp: 'Copy mini-program code',
        copied: 'Copied',
        copyManual: 'Manual',
        copySuccess: 'Copied to clipboard',
        copyUnsupported: 'Copy the code manually',
        h5: 'H5',
        weapp: 'Mini Program',
        confirm: 'Confirm',
        cancel: 'Cancel',
        cityTitle: 'Select City',
        fruitTitle: 'Select Fruit',
        upload: 'Upload',
        mobile: 'Mobile',
        mobilePlaceholder: 'Mobile number',
        searchPlaceholder: 'Search',
        selectPlaceholder: 'Select city',
        loadingText: 'Loading',
        skeletonTitle: 'Skeleton cases',
        skeletonArticle: 'Article',
        skeletonImage: 'Image',
        skeletonVideo: 'Video',
        skeletonImageContent: 'Product cover loaded',
        skeletonVideoContent: 'Tutorial video loaded',
        skeletonShowContent: 'Show content',
        skeletonShowLoading: 'Show skeleton',
        skeletonContentTitle: 'Cross-runtime loading state',
        skeletonContentBody: 'Real content replaces the placeholder without changing the surrounding layout.',
        textareaPlaceholder: 'Enter content',
        keyboardDone: 'Done',
        keyboardDelete: 'Delete',
        reopen: 'Open',
        save: 'Save',
        saveFailed: 'Save failed',
        saveSuccess: 'Saved',
        account: 'Business name',
        contact: 'Contact phone',
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
        company: 'Company',
        companyName: 'Company Name',
        companyContact: 'Contact',
        companyPhone: 'Phone',
        companyType: 'Type',
        companyNameLabel: 'Name',
        companyContactLabel: 'Contact',
        companyPhoneLabel: 'Phone',
        primaryCompany: 'Primary',
        setPrimaryCompany: 'Set Primary',
        headOffice: 'Head Office',
        branchOffice: 'Branch',
        addCompany: 'Add Company',
        removeCompany: 'Remove',
        companyCountSuffix: 'items',
        password: 'Confirm PIN',
        remark: 'Project notes',
        bookingTitle: 'Book a service',
        bookingHint: 'Available May 10–20',
        selectedDate: 'Selected date',
        bookingConfirmed: 'Appointment confirmed',
        changeDate: 'Change date',
        deliveryTitle: 'Choose delivery date',
        deliveryHint: 'Standard delivery · May 10–20',
        deliverySelected: 'Delivery scheduled',
        addressTitle: 'Delivery region',
        addressHint: 'Choose province and city',
        addressSelected: 'Selected region',
        changeAddress: 'Change region',
        notifyTitle: 'Notification channels',
        notifyHint: 'Choose up to two',
        notifyWeChat: 'WeChat',
        notifySms: 'SMS',
        notifyEmail: 'Email',
        selectedCount: 'Selected',
        invoiceDateTitle: 'Invoice date',
        invoiceDateHint: 'Used for billing and reconciliation',
        invoiceDateSelected: 'Invoice date selected',
        changeInvoiceDate: 'Change date',
        formTitle: 'Submit a project brief',
        formHint: 'Tell us how your team works and what you need.',
        formSectionIdentity: 'Business contact',
        formSectionNeeds: 'Project needs',
        formSectionConfirm: 'Confirmation',
        qualification: 'Supporting files',
        quantityTitle: 'Purchase seats',
        quantityHint: 'Up to 5 seats per order',
        quantityProduct: 'Varo Pro seat',
        perSeat: '$39 / seat',
        subtotal: 'Subtotal',
        amountTitle: 'Payment amount',
        amountHint: 'Single payment limit $50,000',
        amountEntered: 'Amount entered',
        changeAmount: 'Edit amount',
        deliveryTimeTitle: 'Delivery window',
        deliveryTimeHint: 'Choose a convenient time',
        timeSelected: 'Delivery window selected',
        changeTime: 'Change time',
        paymentTitle: 'Payment method',
        paymentHint: 'Order #1042 · Secure checkout',
        wechatPay: 'WeChat Pay',
        alipay: 'Alipay',
        cardPay: 'Bank card',
        selectedMethod: 'Selected',
        orderAmount: 'Pay now · ¥299',
        warehouseTitle: 'Default fulfillment center',
        warehouseHint: 'Affects inventory and shipping fees',
        warehouseSelected: 'Current center',
        notificationTitle: 'Notification settings',
        notificationHint: 'Choose which updates can interrupt you',
        marketingNotice: 'Product announcements',
        marketingNoticeDesc: 'Occasional feature and campaign updates',
        orderNotice: 'Order status',
        orderNoticeDesc: 'Required for fulfillment updates',
        switchOn: 'On',
        switchOff: 'Off',
        budgetTitle: 'Monthly campaign budget',
        budgetHint: 'Adjust between ¥0 and ¥10,000',
        budgetAllocated: 'Allocated',
        reviewTitle: 'Service rating',
        reviewHint: 'Order #1042 · Delivered today',
        reviewScore: 'Your rating',
        componentSearchTitle: 'Find a component',
        componentSearchHint: 'Search 48 cross-platform components',
        searchResults: 'Results',
        formCategory: 'Form component',
        pinTitle: 'Payment PIN',
        pinHint: 'Enter the 6-digit PIN',
        pinComplete: 'Complete',
        pinIncomplete: 'In progress',
        pinSecurity: 'Encrypted locally and never displayed in plain text.',
        textareaTitle: 'Issue details',
        textareaHint: 'Describe the steps and expected result',
        textareaCount: 'Characters',
        uploaderTitle: 'Business documents',
        uploaderHint: 'JPG, PNG, or PDF · Up to 3 files',
        uploaderProgress: 'Uploading',
      }
    : {
        preview: '演示效果',
        code: '示例代码',
        codeExpand: '展开代码',
        codeCollapse: '收起代码',
        copyCode: '复制代码',
        copyCodeH5: '复制 H5 代码',
        copyCodeWeapp: '复制小程序代码',
        copied: '已复制',
        copyManual: '手动复制',
        copySuccess: '已复制到剪贴板',
        copyUnsupported: '请手动复制代码',
        h5: 'H5 写法',
        weapp: '小程序写法',
        confirm: '确定',
        cancel: '取消',
        cityTitle: '选择城市',
        fruitTitle: '选择水果',
        upload: '上传文件',
        mobile: '手机号',
        mobilePlaceholder: '请输入手机号',
        searchPlaceholder: '搜索',
        selectPlaceholder: '请选择城市',
        loadingText: '加载中',
        skeletonTitle: '骨架屏案例',
        skeletonArticle: '文章',
        skeletonImage: '图片',
        skeletonVideo: '视频',
        skeletonImageContent: '商品封面已加载',
        skeletonVideoContent: '教学视频已加载',
        skeletonShowContent: '显示内容',
        skeletonShowLoading: '显示骨架屏',
        skeletonContentTitle: '跨端加载状态',
        skeletonContentBody: '真实内容替换占位结构时，不改变外围布局。',
        textareaPlaceholder: '请输入内容',
        keyboardDone: '完成',
        keyboardDelete: '删除',
        reopen: '打开',
        save: '保存',
        saveFailed: '保存失败',
        saveSuccess: '保存成功',
        account: '商户名称',
        contact: '联系人手机',
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
        company: '公司',
        companyName: '公司名称',
        companyContact: '联系人',
        companyPhone: '联系电话',
        companyType: '公司类型',
        companyNameLabel: '名称',
        companyContactLabel: '联系人',
        companyPhoneLabel: '电话',
        primaryCompany: '主公司',
        setPrimaryCompany: '设为主公司',
        headOffice: '总部',
        branchOffice: '分部',
        addCompany: '新增公司',
        removeCompany: '删除',
        companyCountSuffix: '项',
        password: '确认密码',
        remark: '项目备注',
        bookingTitle: '预约服务',
        bookingHint: '5 月 10–20 日可预约',
        selectedDate: '已选日期',
        bookingConfirmed: '预约日期已确认',
        changeDate: '修改日期',
        deliveryTitle: '选择配送日期',
        deliveryHint: '普通配送 · 5 月 10–20 日',
        deliverySelected: '预计送达',
        addressTitle: '配送地区',
        addressHint: '请选择省份和城市',
        addressSelected: '已选地区',
        changeAddress: '修改地区',
        notifyTitle: '通知方式',
        notifyHint: '最多选择两种',
        notifyWeChat: '微信通知',
        notifySms: '短信',
        notifyEmail: '邮件',
        selectedCount: '已选择',
        invoiceDateTitle: '发票日期',
        invoiceDateHint: '用于开票与账单对账',
        invoiceDateSelected: '已选择开票日期',
        changeInvoiceDate: '修改日期',
        formTitle: '提交合作需求',
        formHint: '完善联系人、项目方向和预算信息。',
        formSectionIdentity: '商户联系信息',
        formSectionNeeds: '项目需求',
        formSectionConfirm: '确认与附件',
        qualification: '资质文件',
        quantityTitle: '购买席位',
        quantityHint: '每单最多购买 5 个',
        quantityProduct: 'Varo Pro 专业版',
        perSeat: '¥39 / 席位',
        subtotal: '小计',
        amountTitle: '付款金额',
        amountHint: '单笔限额 ¥50,000',
        amountEntered: '金额已填写',
        changeAmount: '修改金额',
        deliveryTimeTitle: '配送时段',
        deliveryTimeHint: '选择方便收货的时间',
        timeSelected: '已选择配送时段',
        changeTime: '修改时段',
        paymentTitle: '支付方式',
        paymentHint: '订单 #1042 · 安全收银台',
        wechatPay: '微信支付',
        alipay: '支付宝',
        cardPay: '银行卡',
        selectedMethod: '已选择',
        orderAmount: '应付 · ¥299',
        warehouseTitle: '默认发货仓',
        warehouseHint: '影响库存分配与配送费用',

        warehouseSelected: '当前仓库',
        notificationTitle: '通知设置',
        notificationHint: '选择允许打扰你的消息类型',
        marketingNotice: '产品与活动通知',
        marketingNoticeDesc: '偶尔推送功能更新与优惠活动',
        orderNotice: '订单状态通知',
        orderNoticeDesc: '履约进度必需，无法关闭',
        switchOn: '已开启',
        switchOff: '已关闭',
        budgetTitle: '月度推广预算',
        budgetHint: '可在 ¥0–¥10,000 之间调整',
        budgetAllocated: '当前预算',
        reviewTitle: '服务评分',
        reviewHint: '订单 #1042 · 今日已送达',
        reviewScore: '你的评分',
        componentSearchTitle: '搜索组件',
        componentSearchHint: '在 48 个跨端组件中查找',
        searchResults: '搜索结果',
        formCategory: '表单组件',
        pinTitle: '支付密码',
        pinHint: '请输入 6 位数字密码',
        pinComplete: '输入完成',
        pinIncomplete: '输入中',
        pinSecurity: '本地加密处理，不会显示明文。',
        textareaTitle: '问题描述',
        textareaHint: '说明复现步骤与预期结果',
        textareaCount: '已输入',
        uploaderTitle: '资质材料',
        uploaderHint: '支持 JPG、PNG、PDF · 最多 3 份',
        uploaderProgress: '正在上传',
      },
)
const paymentMethodLabel = computed(() => {
  const labels: Record<string, string> = {
    wechat: copy.value.wechatPay,
    alipay: copy.value.alipay,
    card: copy.value.cardPay,
  }
  return labels[radioValue.value] ?? ''
})
const rateFeedback = computed(() => {
  const labels = props.locale === 'en'
    ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
    : ['', '很差', '一般', '不错', '满意', '超出预期']
  return labels[rateValue.value] ?? ''
})

const cascaderOptions = computed(() =>
  props.locale === 'en'
    ? [
        {
          label: 'Zhejiang',
          value: 'zhejiang',
          children: [
            { label: 'Hangzhou', value: 'hangzhou' },
            { label: 'Ningbo', value: 'ningbo' },
          ],
        },
        {
          label: 'Jiangsu',
          value: 'jiangsu',
          children: [
            { label: 'Nanjing', value: 'nanjing' },
            { label: 'Suzhou', value: 'suzhou' },
          ],
        },
      ]
    : [
        {
          label: '浙江',
          value: 'zhejiang',
          children: [
            { label: '杭州', value: 'hangzhou' },
            { label: '宁波', value: 'ningbo' },
          ],
        },
        {
          label: '江苏',
          value: 'jiangsu',
          children: [
            { label: '南京', value: 'nanjing' },
            { label: '苏州', value: 'suzhou' },
          ],
        },
      ],
)

const pickerColumns = computed(() =>
  props.locale === 'en'
    ? [
        { label: 'Morning · 09:00–12:00', value: 'morning' },
        { label: 'Afternoon · 13:00–17:00', value: 'afternoon' },
        { label: 'Evening · 18:00–21:00', value: 'evening' },
      ]
    : [
        { label: '上午 · 09:00–12:00', value: 'morning' },
        { label: '下午 · 13:00–17:00', value: 'afternoon' },
        { label: '晚间 · 18:00–21:00', value: 'evening' },
      ],
)

const selectOptions = computed(() =>
  props.locale === 'en'
    ? [
        { label: 'Shanghai center', value: 'shanghai' },
        { label: 'Hangzhou center', value: 'hangzhou' },
        { label: 'Shenzhen center', value: 'shenzhen' },
      ]
    : [
        { label: '上海仓', value: 'shanghai' },
        { label: '杭州仓', value: 'hangzhou' },
        { label: '深圳仓', value: 'shenzhen' },
      ],
)

const selectOptionLabel = computed(() =>
  selectOptions.value.find(option => option.value === selectValue.value)?.label ?? '',
)

const platformPackage = computed(() => (activePlatform.value === 'h5' ? '@varo-ui/h5' : '@varo-ui/weapp'))
const packageTag = computed(() => (activePlatform.value === 'h5' ? '@varo-ui/h5' : '@varo-ui/weapp'))

function codeFor(packageName: string) {
  const isEn = props.locale === 'en'
  const runtimePackage = packageName === '@varo-ui/weapp' ? 'wevu' : 'vue'

  switch (props.example) {
    case 'calendar':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VCalendar } from '${packageName}'

const visible = shallowRef(true)
const date = shallowRef('2026-05-14')
const confirmedDate = shallowRef('')

function confirmDate(value?: string) {
  confirmedDate.value = value ?? date.value
  visible.value = false
}
<\/script>

<template>
  <section class="booking-calendar">
    <header>
      <span>${copy.value.bookingTitle}</span>
      <strong>{{ date }}</strong>
    </header>
    <VCalendar
      v-model:visible="visible"
      v-model:value="date"
      month="2026-05"
      min-date="2026-05-10"
      max-date="2026-05-20"
      confirm-text="${copy.value.confirm}"
      @confirm="confirmDate"
    />
    <p v-if="confirmedDate" role="status">${copy.value.bookingConfirmed}：{{ confirmedDate }}</p>
  </section>
</template>
      `.trim()
    case 'calendar-card':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VCalendarCard } from '${packageName}'

const date = shallowRef('2026-05-14')
<\/script>

<template>
  <section class="delivery-calendar">
    <header>
      <div>
        <strong>${copy.value.deliveryTitle}</strong>
        <span>${copy.value.deliveryHint}</span>
      </div>
      <output>{{ date }}</output>
    </header>
    <VCalendarCard
      v-model:value="date"
      month="2026-05"
      min-date="2026-05-10"
      max-date="2026-05-20"
    />
  </section>
</template>
      `.trim()
    case 'cascader':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VCascader } from '${packageName}'

const visible = shallowRef(true)
const value = shallowRef<Array<string | number>>(['zhejiang'])
const result = shallowRef('')
const options = ${isEn ? '[{ label: \'Zhejiang\', value: \'zhejiang\', children: [{ label: \'Hangzhou\', value: \'hangzhou\' }] }]' : '[{ label: \'浙江\', value: \'zhejiang\', children: [{ label: \'杭州\', value: \'hangzhou\' }] }]'}

function confirmRegion(payload: { labels: string[] }) {
  result.value = payload.labels.join(' / ')
}
<\/script>

<template>
  <VCascader
    v-model:visible="visible"
    v-model:value="value"
    title="${copy.value.cityTitle}"
    :options="options"
    @confirm="confirmRegion"
  />
  <p v-if="result" role="status">${copy.value.addressSelected}：{{ result }}</p>
</template>
      `.trim()
    case 'checkbox':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VCheckbox, VCheckboxGroup } from '${packageName}'

const channels = shallowRef(['wechat'])
<\/script>

<template>
  <section class="notification-options">
    <header>
      <strong>${copy.value.notifyTitle}</strong>
      <span>{{ channels.length }}/2</span>
    </header>
    <VCheckboxGroup v-model:value="channels" direction="horizontal" :max="2">
      <VCheckbox label="${copy.value.notifyWeChat}" value="wechat" />
      <VCheckbox label="${copy.value.notifySms}" value="sms" />
      <VCheckbox label="${copy.value.notifyEmail}" value="email" />
    </VCheckboxGroup>
  </section>
</template>
      `.trim()
    case 'date-picker':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VDatePicker } from '${packageName}'

const visible = shallowRef(true)
const date = shallowRef('2026-05-14')
const result = shallowRef('')

function confirmDate(value?: string) {
  result.value = value ?? date.value
}
<\/script>

<template>
  <VDatePicker
    v-model:visible="visible"
    v-model:value="date"
    month="2026-05"
    confirm-text="${copy.value.confirm}"
    @confirm="confirmDate"
  />
  <p v-if="result" role="status">${copy.value.invoiceDateSelected}：{{ result }}</p>
</template>
      `.trim()
    case 'form':
      return `
<script setup lang="ts">
import { reactive } from '${runtimePackage}'
import {
  VButton,
  VCheckbox,
  VCheckboxGroup,
  VForm,
  VFormItem,
  VInput,
  VInputNumber,
  VRadio,
  VRadioGroup,
  VRate,
  VShortPassword,
  VTextarea
} from '${packageName}'

const model = reactive({
  account: '',
  contact: '',
  gender: '',
  interests: [],
  password: '',
  quantity: 1,
  remark: '',
  score: 0
})
const rules = {
  account: [
    { required: true, trigger: 'change' },
    { min: 3, trigger: 'change' }
  ],
  contact: [
    { required: true, trigger: ['change', 'blur'] },
    { length: 11, trigger: 'blur' }
  ],
  gender: { required: true, trigger: 'change' },
  interests: { required: true, trigger: 'change' },
  password: [
    { required: true, trigger: 'change' },
    { length: 6, trigger: 'change' }
  ],
  remark: [
    { required: true, trigger: ['change', 'blur'] },
    { max: 80, trigger: 'blur' }
  ],
  score: { min: 1, trigger: 'change' }
}
<\/script>

<template>
  <VForm id="profile-form" :model="model" :rules="rules" @submit="onSubmit" @failed="onFailed">
    <VFormItem name="account" label="${copy.value.account}" required>
      <template #default="{ setValue, value }">
        <VInput :value="value.value" @update:value="setValue" />
      </template>
    </VFormItem>
    <VFormItem name="contact" label="${copy.value.contact}" required>
      <template #default="{ onBlur, setValue, value }">
        <VInput :value="value.value" @blur="onBlur" @update:value="setValue" />
      </template>
    </VFormItem>
    <VFormItem name="gender" label="${copy.value.gender}" required>
      <template #default="{ setValue, value }">
        <VRadioGroup :value="value.value" @update:value="setValue">
          <VRadio label="${copy.value.male}" value="male" />
          <VRadio label="${copy.value.female}" value="female" />
        </VRadioGroup>
      </template>
    </VFormItem>
    <VFormItem name="interests" label="${copy.value.interests}" required>
      <template #default="{ setValue, value }">
        <VCheckboxGroup :value="value.value" @update:value="setValue">
          <VCheckbox label="${copy.value.design}" value="design" />
          <VCheckbox label="${copy.value.develop}" value="develop" />
        </VCheckboxGroup>
      </template>
    </VFormItem>
    <VFormItem name="quantity" label="${copy.value.quantity}">
      <template #default="{ setValue, value }">
        <VInputNumber :value="value.value" @update:value="setValue" />
      </template>
    </VFormItem>
    <VFormItem name="score" label="${copy.value.score}" required>
      <template #default="{ setValue, value }">
        <VRate :value="value.value" @update:value="setValue" />
      </template>
    </VFormItem>
    <VFormItem name="password" label="${copy.value.password}" required>
      <template #default="{ setValue, value }">
        <VShortPassword :value="value.value" @update:value="setValue" />
      </template>
    </VFormItem>
    <VFormItem name="remark" label="${copy.value.remark}" required>
      <template #default="{ onBlur, setValue, value }">
        <VTextarea :value="value.value" @blur="onBlur" @update:value="setValue" />
      </template>
    </VFormItem>
  </VForm>

  <VButton form="profile-form" native-type="submit" tone="primary">
    ${copy.value.save}
  </VButton>
</template>
      `.trim()
    case 'form-array':
      return `
<script setup lang="ts">
import { reactive } from '${runtimePackage}'
import { z } from 'zod'
import { VButton, VForm, VFormItem, VInput, VRadio, VRadioGroup } from '${packageName}'

const model = reactive({
  companies: [{ name: '', contact: '', phone: '', type: '' }]
})
const validationSchema = z.object({
  companies: z.array(
    z.object({
      name: z.string().min(2, '${isEn ? 'Use at least 2 characters' : '公司名称至少 2 个字符'}'),
      contact: z.string().min(1, '${isEn ? 'Enter a contact name' : '请输入联系人'}'),
      phone: z.string().regex(/^\\d{11}$/, '${isEn ? 'Enter an 11-digit phone number' : '请输入 11 位手机号'}'),
      type: z.string().min(1, '${isEn ? 'Select a company type' : '请选择公司类型'}')
    })
  ).min(1, '${isEn ? 'Add at least one company' : '请至少添加一家公司'}')
})

function addCompany() {
  model.companies.push({ name: '', contact: '', phone: '', type: '' })
}

function removeCompany(index: number) {
  model.companies.splice(index, 1)
}
<\/script>

<template>
  <VForm id="company-form" :model="model" :validation-schema="validationSchema">
    <div v-for="(company, index) in model.companies" :key="index">
      <VFormItem :name="\`companies.\${index}.name\`" :label="\`${copy.value.company} \${index + 1} ${isEn ? 'Name' : '名称'}\`" required>
        <template #default="{ setValue, value }">
          <VInput :value="value.value" @update:value="setValue" />
        </template>
      </VFormItem>
      <VFormItem :name="\`companies.\${index}.contact\`" :label="\`${copy.value.company} \${index + 1} ${isEn ? 'Contact' : '联系人'}\`" required>
        <template #default="{ setValue, value }">
          <VInput :value="value.value" @update:value="setValue" />
        </template>
      </VFormItem>
      <VFormItem :name="\`companies.\${index}.phone\`" :label="\`${copy.value.company} \${index + 1} ${isEn ? 'Phone' : '电话'}\`" required>
        <template #default="{ onBlur, setValue, value }">
          <VInput :value="value.value" @blur="onBlur" @update:value="setValue" />
        </template>
      </VFormItem>
      <VFormItem :name="\`companies.\${index}.type\`" :label="\`${copy.value.company} \${index + 1} ${isEn ? 'Type' : '类型'}\`" required>
        <template #default="{ setValue, value }">
          <VRadioGroup :value="value.value" direction="horizontal" @update:value="setValue">
            <VRadio label="${copy.value.headOffice}" value="head" />
            <VRadio label="${copy.value.branchOffice}" value="branch" />
          </VRadioGroup>
        </template>
      </VFormItem>
    </div>
  </VForm>

  <button type="button" @click="addCompany()">${copy.value.addCompany}</button>
  <button v-if="model.companies.length > 1" type="button" @click="removeCompany(model.companies.length - 1)">
    ${copy.value.removeCompany}
  </button>
  <VButton form="company-form" native-type="submit" tone="primary">
    ${copy.value.save}
  </VButton>
</template>
      `.trim()
    case 'input-number':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VInputNumber } from '${packageName}'

const count = shallowRef(2)
<\/script>

<template>
  <section class="seat-quantity">
    <header>
      <strong>${copy.value.quantityTitle}</strong>
      <output>${copy.value.subtotal}：¥{{ count * 39 }}</output>
    </header>
    <VInputNumber v-model:value="count" :min="1" :max="5" />
  </section>
</template>
      `.trim()
    case 'number-keyboard':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VNumberKeyboard } from '${packageName}'

const visible = shallowRef(true)
const amount = shallowRef('128')

function input(key: string) {
  if (key === '.' && amount.value.includes('.')) return
  amount.value += key
}

function remove() {
  amount.value = amount.value.slice(0, -1)
}
<\/script>

<template>
  <output>¥{{ amount || '0' }}</output>
  <VNumberKeyboard
    :visible="visible"
    extra-key="."
    @input="input"
    @delete="remove"
    @close="visible = false"
  />
</template>
      `.trim()
    case 'picker':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VPicker } from '${packageName}'

const visible = shallowRef(true)
const value = shallowRef('morning')
const result = shallowRef('')
const columns = ${isEn ? '[{ label: \'Morning · 09:00–12:00\', value: \'morning\' }, { label: \'Afternoon · 13:00–17:00\', value: \'afternoon\' }]' : '[{ label: \'上午 · 09:00–12:00\', value: \'morning\' }, { label: \'下午 · 13:00–17:00\', value: \'afternoon\' }]'}

function confirm(payload: { option?: { label: string } }) {
  result.value = payload.option?.label ?? ''
}
<\/script>

<template>
  <VPicker
    v-model:visible="visible"
    v-model:value="value"
    title="${copy.value.deliveryTimeTitle}"
    :columns="columns"
    @confirm="confirm"
  />
  <p v-if="result" role="status">${copy.value.timeSelected}：{{ result }}</p>
</template>
      `.trim()
    case 'radio':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VRadio, VRadioGroup } from '${packageName}'

const payType = shallowRef('wechat')
<\/script>

<template>
  <section class="payment-methods">
    <header>
      <strong>${copy.value.paymentTitle}</strong>
      <output>${copy.value.orderAmount}</output>
    </header>
    <VRadioGroup v-model:value="payType" direction="horizontal">
      <VRadio label="${copy.value.wechatPay}" value="wechat" />
      <VRadio label="${copy.value.alipay}" value="alipay" />
      <VRadio label="${copy.value.cardPay}" value="card" />
    </VRadioGroup>
  </section>
</template>
      `.trim()
    case 'range':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VRange } from '${packageName}'

const value = shallowRef(40)
<\/script>

<template>
  <section class="campaign-budget">
    <output>${copy.value.budgetAllocated}：¥{{ value * 100 }}</output>
    <VRange
      v-model:value="value"
      aria-label="${copy.value.budgetTitle}"
      :step="10"
    />
  </section>
</template>
      `.trim()
    case 'rate':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VRate } from '${packageName}'

const value = shallowRef(3)
<\/script>

<template>
  <VRate
    v-model:value="value"
    aria-label="${copy.value.reviewTitle}"
  />
  <output>${copy.value.reviewScore}：{{ value }}/5</output>
</template>
      `.trim()
    case 'searchbar':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VSearchbar } from '${packageName}'

const keyword = shallowRef('Form')
<\/script>

<template>
  <VSearchbar
    v-model:value="keyword"
    input-aria-label="${copy.value.componentSearchTitle}"
    placeholder="${copy.value.searchPlaceholder}"
    @search="onSearch"
  />
</template>
      `.trim()
    case 'short-password':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VShortPassword } from '${packageName}'

const password = shallowRef('123')
<\/script>

<template>
  <VShortPassword
    v-model:value="password"
    input-aria-label="${copy.value.pinTitle}"
    @complete="onComplete"
  />
</template>
      `.trim()
    case 'textarea':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VTextarea } from '${packageName}'

const value = shallowRef('')
<\/script>

<template>
  <VTextarea
    v-model:value="value"
    aria-label="${copy.value.textareaTitle}"
    :max-length="120"
    :rows="4"
    show-word-limit
    placeholder="${copy.value.textareaPlaceholder}"
  />
</template>
      `.trim()
    case 'uploader':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VUploader } from '${packageName}'

const files = shallowRef([
  { name: 'business-license.jpg', progress: 100, status: 'done' },
  { name: 'brand-guide.pdf', progress: 64, status: 'uploading' },
])
<\/script>

<template>
  <VUploader
    v-model:value="files"
    accept=".jpg,.jpeg,.png,.pdf"
    list-type="card"
    :max-count="3"
    multiple
    upload-text="${copy.value.upload}"
  />
</template>
      `.trim()
    case 'select':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VSelect } from '${packageName}'

const warehouse = shallowRef<string | number>('hangzhou')
const options = ${isEn ? '[{ label: \'Shanghai center\', value: \'shanghai\' }, { label: \'Hangzhou center\', value: \'hangzhou\' }, { label: \'Shenzhen center\', value: \'shenzhen\' }]' : '[{ label: \'上海仓\', value: \'shanghai\' }, { label: \'杭州仓\', value: \'hangzhou\' }, { label: \'深圳仓\', value: \'shenzhen\' }]'}
<\/script>

<template>
  <VSelect
    v-model:value="warehouse"
    mode="dropdown"
    :options="options"
    placeholder="${copy.value.selectPlaceholder}"
    clearable
  />
</template>
      `.trim()
    case 'switch':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VSwitch } from '${packageName}'

const marketingEnabled = shallowRef(true)
<\/script>

<template>
  <section class="notification-settings">
    <label>
      <span>${copy.value.marketingNotice}</span>
      <VSwitch v-model="marketingEnabled" aria-label="${copy.value.marketingNotice}" />
    </label>
    <label>
      <span>${copy.value.orderNotice}</span>
      <VSwitch :model-value="true" aria-label="${copy.value.orderNotice}" disabled />
    </label>
  </section>
</template>
      `.trim()
    case 'toast':
      return `
<script setup lang="ts">
import { VToast } from '${packageName}'

const toasts = [
  { message: '信息提示', type: 'text' },
  { message: '警告提示', type: 'warning' },
  { message: '错误提示', type: 'danger' },
  { message: '成功提示', type: 'success' }
] as const
<\/script>

<template>
  <VToast v-for="toast in toasts" :key="toast.type" :visible="true" :type="toast.type" :message="toast.message" :closeable="false" />
</template>
      `.trim()
    case 'loading':
      return `
<script setup lang="ts">
import { VLoading } from '${packageName}'
<\/script>

<template>
  <VLoading text="${copy.value.loadingText}" />
  <VLoading size="sm" tone="primary" />
  <VLoading size="lg" tone="success" />
</template>
      `.trim()
    case 'skeleton':
      return `
<script setup lang="ts">
import { shallowRef } from '${runtimePackage}'
import { VSkeleton } from '${packageName}'

const loading = shallowRef(true)
<\/script>

<template>
  <VSkeleton :loading="loading" :delay="180" content-fade avatar title :rows="4" round>
    <article>
      <strong>${copy.value.skeletonContentTitle}</strong>
      <p>${copy.value.skeletonContentBody}</p>
    </article>
  </VSkeleton>
  <VSkeleton :loading="loading" :delay="180" content-fade media="image" :rows="2">
    <article>Image loaded</article>
  </VSkeleton>
  <VSkeleton :loading="loading" :delay="180" content-fade media="video" :rows="2">
    <article>Video loaded</article>
  </VSkeleton>
</template>
      `.trim()
    default:
      return ''
  }
}

const activeCode = computed(() => codeFor(platformPackage.value))
const codeToggleLabel = computed(() =>
  codeExpanded.value ? copy.value.codeCollapse : copy.value.codeExpand,
)
const copyLabel = computed(() => {
  if (copyState.value === 'copied') {
    return copy.value.copied
  }

  if (copyState.value === 'unsupported') {
    return copy.value.copyManual
  }

  return activePlatform.value === 'h5' ? copy.value.copyCodeH5 : copy.value.copyCodeWeapp
})

function resetCopyState() {
  if (copyFeedbackTimer) {
    window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = undefined
  }

  copyState.value = 'idle'
}

async function copySnippet() {
  if (!navigator?.clipboard?.writeText) {
    copyState.value = 'unsupported'
    return
  }

  await navigator.clipboard.writeText(activeCode.value)
  copyState.value = 'copied'
  copyFeedbackTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    copyFeedbackTimer = undefined
  }, 1800)
}

function setPlatform(platform: Platform) {
  activePlatform.value = platform
  resetCopyState()
}

function toggleCodeExpanded() {
  codeExpanded.value = !codeExpanded.value
  if (!codeExpanded.value) {
    resetCopyState()
  }
}

onBeforeUnmount(() => resetCopyState())

function addFormArrayCompany() {
  formArrayModel.companies.push({ name: '', contact: '', phone: '', type: '' })
}

function removeFormArrayCompany(index: number) {
  formArrayModel.companies.splice(index, 1)
  if (primaryCompanyIndex.value > index) {
    primaryCompanyIndex.value -= 1
  }
  else if (primaryCompanyIndex.value >= formArrayModel.companies.length) {
    primaryCompanyIndex.value = Math.max(0, formArrayModel.companies.length - 1)
  }
}

function onDatePickerConfirm(value?: string) {
  datePickerConfirmed.value = value ?? calendarValue.value
  datePickerVisible.value = false
}

function setPrimaryCompany(index: number) {
  primaryCompanyIndex.value = index
}

function onCalendarConfirm(value?: string) {
  calendarConfirmed.value = value ?? calendarValue.value
  calendarVisible.value = false
}
function onCascaderConfirm(payload: { labels: string[] }) {
  cascaderConfirmed.value = payload.labels
  cascaderVisible.value = false
}
function onKeyboardInput(key: string) {
  if (keyboardAmount.value.length >= 8) { return }
  if (key === '.' && keyboardAmount.value.includes('.')) { return }
  keyboardAmount.value += key
}

function onKeyboardDelete() {
  keyboardAmount.value = keyboardAmount.value.slice(0, -1)
}

function onKeyboardClose() {
  keyboardConfirmed.value = keyboardAmount.value
  numberKeyboardVisible.value = false
}

function onPickerConfirm(payload: { option?: { label: string } }) {
  pickerConfirmed.value = payload.option?.label ?? ''
  pickerVisible.value = false
}

function onFormSubmit() {
  formStatus.value = copy.value.saveSuccess
}

function onFormFailed() {
  formStatus.value = copy.value.saveFailed
}

function onFormArraySubmit() {
  formArrayStatus.value = copy.value.saveSuccess
}

function onFormArrayFailed() {
  formArrayStatus.value = copy.value.saveFailed
}
</script>

<template>
  <section class="form-demo">
    <div class="form-demo__stage" :data-platform="activePlatform">
      <div class="form-demo__platform-switch" role="tablist" :aria-label="copy.preview">
        <button
          type="button"
          role="tab"
          :aria-selected="activePlatform === 'h5'"
          :data-active="activePlatform === 'h5'"
          @click="setPlatform('h5')"
        >
          H5
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activePlatform === 'weapp'"
          :data-active="activePlatform === 'weapp'"
          @click="setPlatform('weapp')"
        >
          {{ locale === 'en' ? 'Mini Program' : '小程序' }}
        </button>
      </div>

      <div class="form-demo__preview" :data-example="example">
        <section
          v-if="example === 'checkbox'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.notifyTitle }}</strong>
              <span>{{ copy.notifyHint }}</span>
            </div>
            <output>
              {{ copy.selectedCount }} {{ checkboxValue.length }}/2
            </output>
          </header>
          <VCheckboxGroup
            v-model:value="checkboxValue"
            class="form-demo__choice-grid"
            direction="horizontal"
            :max="2"
          >
            <VCheckbox :label="copy.notifyWeChat" value="wechat" />
            <VCheckbox :label="copy.notifySms" value="sms" />
            <VCheckbox :label="copy.notifyEmail" value="email" />
          </VCheckboxGroup>
        </section>

        <section
          v-else-if="example === 'radio'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.paymentTitle }}</strong>
              <span>{{ copy.paymentHint }}</span>
            </div>
            <output>{{ copy.orderAmount }}</output>
          </header>
          <VRadioGroup
            v-model:value="radioValue"
            class="form-demo__radio-grid"
            direction="horizontal"
          >
            <VRadio value="wechat">
              <span>
                <strong>{{ copy.wechatPay }}</strong>
                <small>{{ locale === 'en' ? 'Recommended' : '推荐' }}</small>
              </span>
            </VRadio>
            <VRadio :label="copy.alipay" value="alipay" />
            <VRadio :label="copy.cardPay" value="card" />
          </VRadioGroup>
          <p class="form-demo__inline-result" role="status">
            {{ copy.selectedMethod }}：{{ paymentMethodLabel }}
          </p>
        </section>

        <section
          v-else-if="example === 'input-number'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.quantityTitle }}</strong>
              <span>{{ copy.quantityHint }}</span>
            </div>
            <output>{{ copy.subtotal }} ¥{{ inputNumberValue * 39 }}</output>
          </header>
          <div class="form-demo__quantity-row">
            <div class="form-demo__quantity-copy">
              <strong>{{ copy.quantityProduct }}</strong>
              <span>{{ copy.perSeat }}</span>
            </div>
            <VInputNumber v-model:value="inputNumberValue" :min="1" :max="5" />
          </div>
        </section>
        <section
          v-else-if="example === 'rate'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.reviewTitle }}</strong>
              <span>{{ copy.reviewHint }}</span>
            </div>
            <output>{{ rateValue }}/5</output>
          </header>
          <div class="form-demo__rate-field">
            <VRate
              v-model:value="rateValue"
              :aria-label="copy.reviewTitle"
            />
            <p role="status">
              {{ rateFeedback }}
            </p>
          </div>
        </section>
        <section
          v-else-if="example === 'range'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.budgetTitle }}</strong>
              <span>{{ copy.budgetHint }}</span>
            </div>
            <output>{{ copy.budgetAllocated }} ¥{{ rangeValue * 100 }}</output>
          </header>
          <div class="form-demo__range-field">
            <VRange
              v-model:value="rangeValue"
              :aria-label="copy.budgetTitle"
              :step="10"
            />
            <div aria-hidden="true">
              <span>¥0</span>
              <span>¥10,000</span>
            </div>
          </div>
        </section>
        <section
          v-else-if="example === 'searchbar'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.componentSearchTitle }}</strong>
              <span>{{ copy.componentSearchHint }}</span>
            </div>
            <output>{{ componentSearchResults.length }} {{ copy.searchResults }}</output>
          </header>
          <VSearchbar
            v-model:value="searchValue"
            :action-text="copy.cancel"
            :input-aria-label="copy.componentSearchTitle"
            :placeholder="copy.searchPlaceholder"
            @cancel="searchValue = ''"
          />
          <div
            v-if="componentSearchResults.length > 0"
            class="form-demo__search-results"
            aria-live="polite"
          >
            <span
              v-for="name in componentSearchResults"
              :key="name"
            >
              <strong>{{ name }}</strong>
              <small>{{ copy.formCategory }}</small>
            </span>
          </div>
        </section>
        <section
          v-else-if="example === 'textarea'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.textareaTitle }}</strong>
              <span>{{ copy.textareaHint }}</span>
            </div>
          </header>
          <VTextarea
            v-model:value="textareaValue"
            :aria-label="copy.textareaTitle"
            :max-length="120"
            :placeholder="copy.textareaPlaceholder"
            :rows="4"
            show-word-limit
          />
        </section>
        <section
          v-else-if="example === 'short-password'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.pinTitle }}</strong>
              <span>{{ copy.pinHint }}</span>
            </div>
            <output>{{ passwordComplete ? copy.pinComplete : `${shortPasswordValue.length}/6` }}</output>
          </header>
          <VShortPassword
            v-model:value="shortPasswordValue"
            :input-aria-label="copy.pinTitle"
          />
          <p class="form-demo__security-note">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3 5.5 5.7v5.1c0 4.2 2.7 8.1 6.5 9.2 3.8-1.1 6.5-5 6.5-9.2V5.7L12 3Z" />
              <path d="m9.2 11.7 1.8 1.8 3.8-4" />
            </svg>
            {{ copy.pinSecurity }}
          </p>
        </section>
        <section
          v-else-if="example === 'select'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.warehouseTitle }}</strong>
              <span>{{ copy.warehouseHint }}</span>
            </div>
            <output>{{ copy.warehouseSelected }}</output>
          </header>
          <div class="form-demo__select-row">
            <VSelect
              v-model:value="selectValue"
              mode="dropdown"
              :options="selectOptions"
              :placeholder="copy.selectPlaceholder"
              clearable
            />
            <span role="status">{{ selectOptionLabel }}</span>
          </div>
        </section>
        <section
          v-else-if="example === 'switch'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.notificationTitle }}</strong>
              <span>{{ copy.notificationHint }}</span>
            </div>
            <output>{{ switchValue ? copy.switchOn : copy.switchOff }}</output>
          </header>
          <div class="form-demo__settings-list">
            <label>
              <span>
                <strong>{{ copy.marketingNotice }}</strong>
                <small>{{ copy.marketingNoticeDesc }}</small>
              </span>
              <VSwitch
                v-model="switchValue"
                :aria-label="copy.marketingNotice"
              />
            </label>
            <label>
              <span>
                <strong>{{ copy.orderNotice }}</strong>
                <small>{{ copy.orderNoticeDesc }}</small>
              </span>
              <VSwitch
                :model-value="true"
                :aria-label="copy.orderNotice"
                disabled
              />
            </label>
          </div>
        </section>
        <section v-else-if="example === 'skeleton'" class="form-demo__skeleton-card">
          <header>
            <strong>{{ copy.skeletonTitle }}</strong>
            <button type="button" @click="skeletonLoading = !skeletonLoading">
              {{ skeletonLoading ? copy.skeletonShowContent : copy.skeletonShowLoading }}
            </button>
          </header>
          <nav class="form-demo__skeleton-cases" aria-label="骨架屏案例">
            <button type="button" data-case="article" :aria-pressed="skeletonCase === 'article'" @click="skeletonCase = 'article'">
              {{ copy.skeletonArticle }}
            </button>
            <button type="button" data-case="image" :aria-pressed="skeletonCase === 'image'" @click="skeletonCase = 'image'">
              {{ copy.skeletonImage }}
            </button>
            <button type="button" data-case="video" :aria-pressed="skeletonCase === 'video'" @click="skeletonCase = 'video'">
              {{ copy.skeletonVideo }}
            </button>
          </nav>
          <div class="form-demo__skeleton-preview">
            <section v-if="skeletonCase === 'article'">
              <VSkeleton :loading="skeletonLoading" :delay="180" content-fade avatar title :rows="4" round>
                <article class="form-demo__skeleton-content">
                  <strong>{{ copy.skeletonContentTitle }}</strong>
                  <p>{{ copy.skeletonContentBody }}</p>
                </article>
              </VSkeleton>
            </section>
            <section v-else-if="skeletonCase === 'image'">
              <VSkeleton :loading="skeletonLoading" :delay="180" content-fade media="image" :rows="2">
                <article class="form-demo__skeleton-media-content" data-kind="image">
                  <span aria-hidden="true">IMG</span>
                  <strong>{{ copy.skeletonImageContent }}</strong>
                </article>
              </VSkeleton>
            </section>
            <section v-else>
              <VSkeleton :loading="skeletonLoading" :delay="180" content-fade media="video" :rows="2">
                <article class="form-demo__skeleton-media-content" data-kind="video">
                  <span aria-hidden="true">▶</span>
                  <strong>{{ copy.skeletonVideoContent }}</strong>
                </article>
              </VSkeleton>
            </section>
          </div>
        </section>
        <div v-else-if="example === 'loading'" class="form-demo__loading-row">
          <VLoading :text="copy.loadingText" />
          <VLoading size="sm" tone="primary" />
          <VLoading size="lg" tone="success" />
        </div>
        <section v-else-if="example === 'toast'" class="form-demo__toast-grid">
          <VToast
            v-for="toast in toastItems"
            :key="toast.id"
            :visible="true"
            :type="toast.type"
            :message="toast.message"
            :closeable="false"
          />
        </section>
        <section
          v-else-if="example === 'uploader'"
          class="form-demo__control-scenario"
        >
          <header class="form-demo__control-head">
            <div>
              <strong>{{ copy.uploaderTitle }}</strong>
              <span>{{ copy.uploaderHint }}</span>
            </div>
            <output>{{ uploaderFiles.length }}/3</output>
          </header>
          <VUploader
            v-model:value="uploaderFiles"
            accept=".jpg,.jpeg,.png,.pdf"
            list-type="card"
            :max-count="3"
            multiple
            :upload-text="copy.upload"
          />
          <p class="form-demo__inline-result" role="status">
            {{ copy.uploaderProgress }}：brand-guide.pdf · 64%
          </p>
        </section>

        <VForm
          v-else-if="example === 'form'"
          :id="formId"
          class="form-demo__save form-demo__save--request"
          :model="formModel"
          :rules="formRules"
          @failed="onFormFailed"
          @submit="onFormSubmit"
        >
          <header class="form-demo__form-intro">
            <div>
              <strong>{{ copy.formTitle }}</strong>
              <span>{{ copy.formHint }}</span>
            </div>
            <span class="form-demo__required-note">{{ locale === 'en' ? '* Required' : '* 必填' }}</span>
          </header>
          <h3 class="form-demo__form-section-title">
            {{ copy.formSectionIdentity }}
          </h3>
          <VFormItem name="account" :label="copy.account" required>
            <template #default="slotProps">
              <VInput
                clearable
                clear-trigger="always"
                :placeholder="copy.account"
                :value="String(slotProps.value.value ?? '')"
                @blur="slotProps.onBlur"
                @update:value="slotProps.setValue"
              />
            </template>
          </VFormItem>

          <VFormItem name="contact" :label="copy.contact" required>
            <template #default="slotProps">
              <VInput
                clearable
                clear-trigger="always"
                :placeholder="copy.mobilePlaceholder"
                :value="String(slotProps.value.value ?? '')"
                @blur="slotProps.onBlur"
                @update:value="slotProps.setValue"
              />
            </template>
          </VFormItem>

          <VFormItem name="email" :label="copy.email" required>
            <template #default="slotProps">
              <VInput
                clearable
                clear-trigger="always"
                placeholder="name@example.com"
                :value="String(slotProps.value.value ?? '')"
                @blur="slotProps.onBlur"
                @update:value="slotProps.setValue"
              />
            </template>
          </VFormItem>

          <h3 class="form-demo__form-section-title">
            {{ copy.formSectionNeeds }}
          </h3>
          <VFormItem name="gender" :label="copy.gender" required>
            <template #default="{ setValue, value }">
              <VRadioGroup :value="value.value as string" direction="horizontal" @update:value="setValue">
                <VRadio :label="copy.male" value="male" />
                <VRadio :label="copy.female" value="female" />
              </VRadioGroup>
            </template>
          </VFormItem>

          <VFormItem class="form-demo__form-field--wide" name="interests" :label="copy.interests" required>
            <template #default="{ setValue, value }">
              <VCheckboxGroup :value="value.value as string[]" direction="horizontal" @update:value="setValue">
                <VCheckbox :label="copy.design" value="design" />
                <VCheckbox :label="copy.develop" value="develop" />
              </VCheckboxGroup>
            </template>
          </VFormItem>

          <VFormItem name="quantity" :label="copy.quantity">
            <template #default="{ setValue, value }">
              <VInputNumber :value="value.value as number" :min="1" :max="9" @update:value="setValue" />
            </template>
          </VFormItem>

          <VFormItem name="score" :label="copy.score" required>
            <template #default="{ setValue, value }">
              <VRate :value="value.value as number" @update:value="setValue" />
            </template>
          </VFormItem>

          <VFormItem class="form-demo__form-field--wide" name="budget" :label="copy.budget" required>
            <template #default="{ setValue, value }">
              <VRange :value="value.value as number" :step="10" @update:value="setValue" />
            </template>
          </VFormItem>

          <h3 class="form-demo__form-section-title">
            {{ copy.formSectionConfirm }}
          </h3>
          <VFormItem class="form-demo__form-field--wide" name="password" :label="copy.password" required>
            <template #default="{ setValue, value }">
              <VShortPassword :value="value.value as string" @update:value="setValue" />
            </template>
          </VFormItem>

          <VFormItem class="form-demo__form-field--wide" name="remark" :label="copy.remark" required>
            <template #default="{ setValue, value }">
              <VTextarea
                :max-length="80"
                :rows="3"
                show-word-limit
                :value="value.value as string"
                @update:value="setValue"
              />
            </template>
          </VFormItem>

          <VFormItem class="form-demo__form-field--wide" name="files" :label="copy.qualification" required>
            <template #default="{ setValue, value }">
              <VUploader :value="value.value as []" :upload-text="copy.upload" @update:value="setValue" />
            </template>
          </VFormItem>
        </VForm>

        <div v-if="example === 'form'" class="form-demo__form-actions">
          <VButton class="form-demo__submit" :form="formId" native-type="submit" tone="primary">
            {{ copy.save }}
          </VButton>
          <span class="form-demo__form-status">{{ formStatus }}</span>
        </div>

        <template v-else-if="example === 'form-array'">
          <div class="form-demo__array-toolbar">
            <span class="form-demo__array-count">
              {{ formArrayModel.companies.length }} {{ copy.companyCountSuffix }}
            </span>
            <button type="button" class="form-demo__array-add" @click="addFormArrayCompany">
              {{ copy.addCompany }}
            </button>
          </div>

          <VForm
            :id="formArrayId"
            class="form-demo__save"
            :model="formArrayModel"
            :validation-schema="formArraySchema"
            @failed="onFormArrayFailed"
            @submit="onFormArraySubmit"
          >
            <section
              v-for="(company, index) in formArrayModel.companies"
              :key="index"
              class="form-demo__array-item"
            >
              <div class="form-demo__array-header">
                <div class="form-demo__array-title">
                  <strong>{{ `${copy.company} ${index + 1}` }}</strong>
                  <span v-if="primaryCompanyIndex === index" class="form-demo__array-badge">
                    {{ copy.primaryCompany }}
                  </span>
                </div>
                <div class="form-demo__array-actions">
                  <button
                    v-if="primaryCompanyIndex !== index"
                    type="button"
                    class="form-demo__array-secondary"
                    @click="setPrimaryCompany(index)"
                  >
                    {{ copy.setPrimaryCompany }}
                  </button>
                  <button
                    v-if="formArrayModel.companies.length > 1"
                    type="button"
                    class="form-demo__array-remove"
                    @click="removeFormArrayCompany(index)"
                  >
                    {{ copy.removeCompany }}
                  </button>
                </div>
              </div>

              <VFormItem
                :name="`companies.${index}.name`"
                :label="`${copy.company} ${index + 1} ${copy.companyNameLabel}`"
                required
              >
                <template #default="slotProps">
                  <VInput
                    clearable
                    clear-trigger="always"
                    :placeholder="copy.companyName"
                    :value="String(slotProps.value.value ?? '')"
                    @update:value="slotProps.setValue"
                  />
                </template>
              </VFormItem>

              <div class="form-demo__array-grid">
                <VFormItem
                  :name="`companies.${index}.contact`"
                  :label="`${copy.company} ${index + 1} ${copy.companyContactLabel}`"
                  required
                >
                  <template #default="slotProps">
                    <VInput
                      clearable
                      clear-trigger="always"
                      :placeholder="copy.companyContact"
                      :value="String(slotProps.value.value ?? '')"
                      @update:value="slotProps.setValue"
                    />
                  </template>
                </VFormItem>

                <VFormItem
                  :name="`companies.${index}.phone`"
                  :label="`${copy.company} ${index + 1} ${copy.companyPhoneLabel}`"
                  required
                >
                  <template #default="slotProps">
                    <VInput
                      clearable
                      clear-trigger="always"
                      :placeholder="copy.mobilePlaceholder"
                      :value="String(slotProps.value.value ?? '')"
                      @blur="slotProps.onBlur"
                      @update:value="slotProps.setValue"
                    />
                  </template>
                </VFormItem>

                <VFormItem
                  class="form-demo__array-field--wide"
                  :name="`companies.${index}.type`"
                  :label="`${copy.company} ${index + 1} ${copy.companyType}`"
                  required
                >
                  <template #default="slotProps">
                    <VRadioGroup
                      :value="slotProps.value.value as string"
                      direction="horizontal"
                      @update:value="slotProps.setValue"
                    >
                      <VRadio :label="copy.headOffice" value="head" />
                      <VRadio :label="copy.branchOffice" value="branch" />
                    </VRadioGroup>
                  </template>
                </VFormItem>
              </div>
            </section>
          </VForm>

          <div class="form-demo__form-actions form-demo__form-actions--array">
            <VButton class="form-demo__submit" :form="formArrayId" native-type="submit" tone="primary">
              {{ copy.save }}
            </VButton>
            <span class="form-demo__form-status">{{ formArrayStatus }}</span>
          </div>
        </template>

        <section
          v-else-if="example === 'calendar-card'"
          class="form-demo__calendar-card-scenario"
        >
          <header class="form-demo__context-head">
            <div>
              <strong>{{ copy.deliveryTitle }}</strong>
              <span>{{ copy.deliveryHint }}</span>
            </div>
            <output>
              <span>{{ copy.deliverySelected }}</span>
              <strong>{{ calendarValue }}</strong>
            </output>
          </header>
          <VCalendarCard
            v-model:value="calendarValue"
            month="2026-05"
            min-date="2026-05-10"
            max-date="2026-05-20"
          />
        </section>
        <section
          v-else-if="example === 'calendar'"
          class="form-demo__calendar-scenario"
        >
          <header class="form-demo__context-head">
            <div>
              <strong>{{ copy.bookingTitle }}</strong>
              <span>{{ copy.bookingHint }}</span>
            </div>
            <output>
              <span>{{ copy.selectedDate }}</span>
              <strong>{{ calendarValue }}</strong>
            </output>
          </header>
          <VCalendar
            v-model:visible="calendarVisible"
            v-model:value="calendarValue"
            month="2026-05"
            min-date="2026-05-10"
            max-date="2026-05-20"
            :confirm-text="copy.confirm"
            @confirm="onCalendarConfirm"
          />
          <div
            v-if="!calendarVisible"
            class="form-demo__selection-result"
            role="status"
          >
            <span class="form-demo__result-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 12 3.2 3.2L17.5 8" />
              </svg>
            </span>
            <div>
              <strong>{{ copy.bookingConfirmed }}</strong>
              <span>{{ calendarConfirmed || calendarValue }}</span>
            </div>
            <VButton
              size="sm"
              tone="default"
              variant="outline"
              @click="calendarVisible = true"
            >
              {{ copy.changeDate }}
            </VButton>
          </div>
        </section>
        <section
          v-else-if="example === 'date-picker'"
          class="form-demo__popup-scenario"
        >
          <header class="form-demo__context-head">
            <div>
              <strong>{{ copy.invoiceDateTitle }}</strong>
              <span>{{ copy.invoiceDateHint }}</span>
            </div>
            <output>
              <span>{{ copy.selectedDate }}</span>
              <strong>{{ calendarValue }}</strong>
            </output>
          </header>
          <VDatePicker
            v-model:visible="datePickerVisible"
            v-model:value="calendarValue"
            month="2026-05"
            :confirm-text="copy.confirm"
            @confirm="onDatePickerConfirm"
          />
          <div
            v-if="!datePickerVisible"
            class="form-demo__selection-result"
            role="status"
          >
            <span class="form-demo__result-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 12 3.2 3.2L17.5 8" />
              </svg>
            </span>
            <div>
              <strong>{{ copy.invoiceDateSelected }}</strong>
              <span>{{ datePickerConfirmed || calendarValue }}</span>
            </div>
            <VButton
              size="sm"
              tone="default"
              variant="outline"
              @click="datePickerVisible = true"
            >
              {{ copy.changeInvoiceDate }}
            </VButton>
          </div>
        </section>
        <section
          v-else-if="example === 'cascader'"
          class="form-demo__popup-scenario"
        >
          <header class="form-demo__context-head">
            <div>
              <strong>{{ copy.addressTitle }}</strong>
              <span>{{ copy.addressHint }}</span>
            </div>
            <output v-if="cascaderConfirmed.length > 0">
              <span>{{ copy.addressSelected }}</span>
              <strong>{{ cascaderConfirmed.join(' / ') }}</strong>
            </output>
          </header>
          <VCascader
            v-model:visible="cascaderVisible"
            v-model:value="cascaderValue"
            :title="copy.cityTitle"
            :confirm-text="copy.confirm"
            :cancel-text="copy.cancel"
            :options="cascaderOptions"
            @cancel="cascaderVisible = false"
            @confirm="onCascaderConfirm"
          />
          <div
            v-if="!cascaderVisible"
            class="form-demo__selection-result"
            role="status"
          >
            <span class="form-demo__result-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 12 3.2 3.2L17.5 8" />
              </svg>
            </span>
            <div>
              <strong>{{ copy.addressSelected }}</strong>
              <span>{{ cascaderConfirmed.join(' / ') }}</span>
            </div>
            <VButton
              size="sm"
              tone="default"
              variant="outline"
              @click="cascaderVisible = true"
            >
              {{ copy.changeAddress }}
            </VButton>
          </div>
        </section>
        <section
          v-else-if="example === 'picker'"
          class="form-demo__popup-scenario"
        >
          <header class="form-demo__context-head">
            <div>
              <strong>{{ copy.deliveryTimeTitle }}</strong>
              <span>{{ copy.deliveryTimeHint }}</span>
            </div>
            <output v-if="pickerConfirmed">
              <span>{{ copy.timeSelected }}</span>
              <strong>{{ pickerConfirmed }}</strong>
            </output>
          </header>
          <VPicker
            v-model:visible="pickerVisible"
            v-model:value="pickerValue"
            :title="copy.deliveryTimeTitle"
            :confirm-text="copy.confirm"
            :cancel-text="copy.cancel"
            :columns="pickerColumns"
            @cancel="pickerVisible = false"
            @confirm="onPickerConfirm"
          />
          <div
            v-if="!pickerVisible"
            class="form-demo__selection-result"
            role="status"
          >
            <span class="form-demo__result-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 12 3.2 3.2L17.5 8" />
              </svg>
            </span>
            <div>
              <strong>{{ copy.timeSelected }}</strong>
              <span>{{ pickerConfirmed }}</span>
            </div>
            <VButton
              size="sm"
              tone="default"
              variant="outline"
              @click="pickerVisible = true"
            >
              {{ copy.changeTime }}
            </VButton>
          </div>
        </section>
        <section
          v-else-if="example === 'number-keyboard'"
          class="form-demo__popup-scenario"
        >
          <header class="form-demo__context-head">
            <div>
              <strong>{{ copy.amountTitle }}</strong>
              <span>{{ copy.amountHint }}</span>
            </div>
            <output class="form-demo__amount-display">
              <span>CNY</span>
              <strong>¥{{ keyboardAmount || '0' }}</strong>
            </output>
          </header>
          <VNumberKeyboard
            :visible="numberKeyboardVisible"
            extra-key="."
            :close-text="copy.keyboardDone"
            :delete-text="copy.keyboardDelete"
            @close="onKeyboardClose"
            @delete="onKeyboardDelete"
            @input="onKeyboardInput"
          />
          <div
            v-if="!numberKeyboardVisible"
            class="form-demo__selection-result"
            role="status"
          >
            <span class="form-demo__result-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 12 3.2 3.2L17.5 8" />
              </svg>
            </span>
            <div>
              <strong>{{ copy.amountEntered }}</strong>
              <span>¥{{ keyboardConfirmed || keyboardAmount }}</span>
            </div>
            <VButton
              size="sm"
              tone="default"
              variant="outline"
              @click="numberKeyboardVisible = true"
            >
              {{ copy.changeAmount }}
            </VButton>
          </div>
        </section>
      </div>

      <button
        class="form-demo__code-toggle"
        :data-active="String(codeExpanded)"
        type="button"
        :aria-expanded="codeExpanded"
        :aria-label="codeToggleLabel"
        @click="toggleCodeExpanded"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="form-demo__code-icon">
          <path
            d="M9 9.75V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1.75"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
          <rect
            x="4"
            y="7"
            width="10"
            height="12"
            rx="2"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
        <span>{{ codeToggleLabel }}</span>
      </button>
    </div>

    <div v-if="codeExpanded" class="form-demo__code" :data-expanded="String(codeExpanded)">
      <div class="form-demo__code-toolbar">
        <div class="form-demo__tabs" role="tablist" :aria-label="copy.code">
          <button
            class="form-demo__tab"
            :data-active="activePlatform === 'h5'"
            type="button"
            role="tab"
            :aria-selected="activePlatform === 'h5'"
            @click="setPlatform('h5')"
          >
            {{ copy.h5 }}
          </button>
          <button
            class="form-demo__tab"
            :data-active="activePlatform === 'weapp'"
            type="button"
            role="tab"
            :aria-selected="activePlatform === 'weapp'"
            @click="setPlatform('weapp')"
          >
            {{ copy.weapp }}
          </button>
        </div>
        <button
          class="form-demo__code-copy"
          type="button"
          :data-state="copyState"
          :aria-label="copyLabel"
          :title="copyLabel"
          @click="copySnippet"
        >
          <span class="form-demo__code-copy-icon" aria-hidden="true" />
          <span class="form-demo__code-copy-label">{{ copyLabel }}</span>
        </button>
      </div>
      <div class="form-demo__code-head">
        <strong>{{ activePlatform === 'h5' ? copy.h5 : copy.weapp }}</strong>
        <span>{{ packageTag }}</span>
      </div>
      <pre><code>{{ activeCode }}</code></pre>
      <p
        v-if="copyState !== 'idle'"
        class="form-demo__code-toast"
        :data-state="copyState"
        role="status"
        aria-live="polite"
      >
        {{ copyState === 'copied' ? copy.copySuccess : copy.copyUnsupported }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.form-demo {
  --form-demo-surface: var(--varo-demo-surface);
  --form-demo-surface-strong: var(--varo-demo-surface-strong);
  --form-demo-border: var(--varo-demo-border);
  --form-demo-shadow: var(--varo-demo-shadow);
  --form-demo-code-bg: #0f1722;
  --form-demo-code-surface: #172231;
  --form-demo-code-border: #304056;
  --form-demo-code-text: #e8eef5;
  --form-demo-code-muted: #9eacc0;

  position: relative;
  margin: 20px 0 28px;
}

.form-demo__stage {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 18px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--form-demo-surface) 94%, transparent),
      var(--form-demo-surface-strong)
    ),
    radial-gradient(circle at top right, color-mix(in srgb, var(--varo-primary) 10%, transparent), transparent 36%);
  border: 1px solid var(--form-demo-border);
  border-radius: var(--varo-demo-radius);
  box-shadow: var(--form-demo-shadow);
}

.form-demo__platform-switch {
  display: inline-flex;
  gap: 4px;
  justify-self: end;
  padding: 3px;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

.form-demo__platform-switch button {
  min-height: 34px;
  padding: 0 13px;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--varo-text-secondary);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 9px;
}

.form-demo__platform-switch button[data-active='true'] {
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--varo-primary) 26%, transparent);
}

.form-demo__platform-switch button:focus-visible {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

.form-demo__preview {
  display: grid;
  gap: 12px;
  align-items: start;
  min-height: 88px;
}

.form-demo__calendar-scenario,
.form-demo__popup-scenario {
  display: grid;
  gap: 12px;
  width: 100%;
}

.form-demo__control-scenario {
  display: grid;
  gap: 16px;
  width: min(100%, 560px);
}

.form-demo__skeleton-card {
  display: grid;
  gap: 18px;
  width: min(100%, 560px);
}

.form-demo__skeleton-card > header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.form-demo__skeleton-card > header strong {
  font-size: 0.84rem;
  color: var(--varo-text-primary);
}

.form-demo__skeleton-card > header button {
  min-height: 36px;
  padding: 0 12px;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--varo-primary);
  cursor: pointer;
  background: var(--varo-primary-soft);
  border: 1px solid color-mix(in srgb, var(--varo-primary) 42%, var(--varo-border));
  border-radius: 10px;
}

.form-demo__skeleton-card > header button:focus-visible {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}

.form-demo__skeleton-cases {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.form-demo__skeleton-cases button {
  min-height: 36px;
  padding: 0 10px;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--varo-text-secondary);
  cursor: pointer;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 10px;
}

.form-demo__skeleton-cases button[aria-pressed='true'] {
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-color: var(--varo-primary);
}

.form-demo__skeleton-preview > section {
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
}

.form-demo__skeleton-media-content {
  display: grid;
  gap: 8px;
  place-content: center;
  aspect-ratio: 16 / 9;
  padding: 14px;
  color: var(--varo-text-primary);
  text-align: center;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.form-demo__skeleton-media-content span {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin: auto;
  font-size: 0.68rem;
  font-weight: 850;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 999px;
}

.form-demo__skeleton-media-content[data-kind='video'] span {
  padding-left: 2px;
  font-size: 0.9rem;
}

.form-demo__skeleton-content {
  display: grid;
  gap: 8px;
  align-content: center;
  min-height: 92px;
}

.form-demo__skeleton-content strong {
  font-size: 0.92rem;
  color: var(--varo-text-primary);
}

.form-demo__skeleton-content p {
  max-width: 48ch;
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.65;
  color: var(--varo-text-secondary);
}

.form-demo__save--request {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  width: min(100%, 720px);
}

.form-demo__form-intro,
.form-demo__form-section-title,
.form-demo__form-field--wide {
  grid-column: 1 / -1;
}

.form-demo__form-intro {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2px 2px 12px;
  border-bottom: 1px solid var(--varo-border-light);
}

.form-demo__form-intro > div {
  display: grid;
  gap: 4px;
}

.form-demo__form-intro strong {
  font-size: 1rem;
  color: var(--varo-text-primary);
}

.form-demo__form-intro span {
  font-size: 0.76rem;
  color: var(--varo-text-secondary);
}

.form-demo__required-note {
  flex: none;
  color: var(--varo-danger) !important;
}

.form-demo__form-section-title {
  margin: 2px 0 -2px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--varo-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 720px) {
  .form-demo__save--request {
    grid-template-columns: minmax(0, 1fr);
  }
}

.form-demo__control-head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.form-demo__control-head > div {
  display: grid;
  gap: 3px;
}

.form-demo__control-head strong {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--varo-text-primary);
}

.form-demo__control-head span {
  font-size: 0.74rem;
  color: var(--varo-text-tertiary);
}

.form-demo__control-head output {
  flex: none;
  padding: 5px 8px;
  font-size: 0.72rem;
  font-weight: 650;
  color: var(--varo-primary);
  background: var(--varo-primary-soft);
  border-radius: 999px;
}

.form-demo__choice-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.form-demo__choice-grid :deep(.varo-checkbox) {
  min-width: 0;
  min-height: 48px;
  padding: 10px 12px;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

.form-demo__choice-grid :deep(.varo-checkbox[data-state='checked']) {
  background: var(--varo-primary-soft);
  border-color: var(--varo-primary);
}

.form-demo__radio-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.form-demo__radio-grid :deep(.varo-radio) {
  min-width: 0;
  min-height: 52px;
  padding: 10px 12px;
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 12px;
}

.form-demo__radio-grid :deep(.varo-radio[aria-checked='true']) {
  background: var(--varo-primary-soft);
  border-color: var(--varo-primary);
}

.form-demo__radio-grid :deep(.varo-radio__label > span) {
  display: grid;
  gap: 2px;
}

.form-demo__radio-grid :deep(.varo-radio__label small) {
  font-size: 0.66rem;
  color: var(--varo-primary);
}

.form-demo__inline-result {
  margin: -4px 0 0;
  font-size: 0.74rem;
  color: var(--varo-text-secondary);
}

.form-demo__select-row {
  display: grid;
  gap: 8px;
}

.form-demo__select-row :deep(.varo-select) {
  width: 100%;
}

.form-demo__select-row > span {
  font-size: 0.74rem;
  color: var(--varo-text-secondary);
}

.form-demo__settings-list {
  display: grid;
  overflow: hidden;
  background: var(--varo-fill-light);
  border-radius: 14px;
}

.form-demo__settings-list > label {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 66px;
  padding: 12px 14px;
}

.form-demo__settings-list > label + label {
  border-top: 1px solid var(--varo-border-light);
}

.form-demo__settings-list label > span {
  display: grid;
  gap: 3px;
}

.form-demo__settings-list strong {
  font-size: 0.82rem;
  color: var(--varo-text-primary);
}

.form-demo__settings-list small {
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.form-demo__range-field {
  display: grid;
  gap: 8px;
  padding: 16px 14px 10px;
  background: var(--varo-fill-light);
  border-radius: 14px;
}

.form-demo__range-field > div {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.form-demo__rate-field {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: var(--varo-fill-light);
  border-radius: 14px;
}

.form-demo__rate-field :deep(.varo-rate__item) {
  min-width: 40px;
  min-height: 40px;
}

.form-demo__rate-field p {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 650;
  color: var(--varo-primary);
}

.form-demo__search-results {
  display: grid;
  overflow: hidden;
  background: var(--varo-fill-light);
  border-radius: 14px;
}

.form-demo__search-results > span {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 10px 14px;
}

.form-demo__search-results > span + span {
  border-top: 1px solid var(--varo-border-light);
}

.form-demo__search-results strong {
  font-size: 0.8rem;
  color: var(--varo-text-primary);
}

.form-demo__search-results small {
  font-size: 0.68rem;
  color: var(--varo-text-tertiary);
}

.form-demo__security-note {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: -4px 0 0;
  font-size: 0.7rem;
  color: var(--varo-text-tertiary);
}

.form-demo__security-note svg {
  flex: none;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--varo-success);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.form-demo__quantity-row {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: var(--varo-fill-light);
  border-radius: 14px;
}

.form-demo__quantity-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.form-demo__quantity-row :deep(.varo-input-number) {
  flex: none;
}

.form-demo__quantity-row strong {
  font-size: 0.82rem;
  color: var(--varo-text-primary);
}

.form-demo__quantity-row span {
  font-size: 0.72rem;
  color: var(--varo-text-tertiary);
}

.form-demo__amount-display strong {
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}

.form-demo__context-head {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 2px 4px 0;
}

.form-demo__context-head > div,
.form-demo__context-head output {
  display: grid;
  gap: 3px;
}

.form-demo__context-head output {
  justify-items: end;
}

.form-demo__calendar-card-scenario {
  display: grid;
  gap: 14px;
  width: min(100%, 420px);
  padding: 16px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 20px;
  box-shadow: var(--varo-shadow-sm);
}

.form-demo__calendar-card-scenario :deep(.varo-calendar-card) {
  width: 100%;
  box-shadow: none;
}

.form-demo__context-head strong {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--varo-text-primary);
}

.form-demo__context-head span {
  font-size: 0.72rem;
  color: var(--varo-text-tertiary);
}

.form-demo__selection-result {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 14px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.form-demo__selection-result > div {
  display: grid;
  gap: 2px;
}

.form-demo__selection-result strong {
  font-size: 0.82rem;
  color: var(--varo-text-primary);
}

.form-demo__selection-result span {
  font-size: 0.74rem;
  color: var(--varo-text-secondary);
}

.form-demo__result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: var(--varo-success);
  background: var(--varo-success-soft);
  border-radius: 10px;
}

.form-demo__result-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.form-demo__preview[data-example='select'] {
  padding-bottom: 8px;
  overflow: visible;
}

.form-demo__preview[data-example='select'] :deep(.varo-select) {
  overflow: visible;
}

.form-demo__stage:has(.form-demo__preview[data-example='select']) {
  overflow: visible;
}

.form-demo__preview[data-example='calendar'],
.form-demo__preview[data-example='date-picker'],
.form-demo__preview[data-example='cascader'],
.form-demo__preview[data-example='picker'],
.form-demo__preview[data-example='number-keyboard'] {
  position: relative;
  max-width: 390px;
  min-height: 280px;
  padding: 12px;
  overflow: hidden;
  background: var(--varo-demo-phone-screen);
  border: 1px solid var(--form-demo-border);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--varo-card-solid) 18%, transparent),
    0 14px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.form-demo__preview[data-example='toast'] {
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
}

.form-demo__toast-grid {
  display: grid;
  gap: 10px;
  width: min(100%, 420px);
}

.form-demo__toast-grid :deep(.varo-toast) {
  position: relative;
  inset: auto;
  width: 100%;
  min-width: 0;
  max-width: none;
  transform: none;
}

.form-demo__preview[data-example='calendar'] :deep(.varo-calendar),
.form-demo__preview[data-example='date-picker'] :deep(.varo-date-picker),
.form-demo__preview[data-example='cascader'] :deep(.varo-cascader),
.form-demo__preview[data-example='picker'] :deep(.varo-picker),
.form-demo__preview[data-example='number-keyboard'] :deep(.varo-number-keyboard) {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--varo-foreground) 10%, transparent);
}

.form-demo__preview .form-demo__reopen {
  position: relative;
  z-index: 1;
  justify-self: start;
}

.form-demo__reopen,
.form-demo__array-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 38px;
  padding: 0 14px;
  font-weight: 700;
  color: var(--varo-primary);
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--varo-primary) 38%, transparent);
  border-radius: 12px;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.form-demo__reopen:hover,
.form-demo__array-add:hover {
  background: color-mix(in srgb, var(--varo-primary) 16%, transparent);
  border-color: color-mix(in srgb, var(--varo-primary) 56%, transparent);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--varo-primary) 14%, transparent);
  transform: translateY(-1px);
}

.form-demo__array-toolbar,
.form-demo__form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.form-demo__form-actions--array {
  justify-content: space-between;
}

.form-demo__form-status {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.form-demo__array-count {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  border-radius: 999px;
}

.form-demo__array-item {
  padding: 14px;
  background: color-mix(in srgb, var(--varo-surface-strong) 72%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 14px;
}

.form-demo__array-header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.form-demo__array-title,
.form-demo__array-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.form-demo__array-header strong {
  font-size: 14px;
}

.form-demo__array-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 800;
  color: var(--varo-primary);
  background: color-mix(in srgb, var(--varo-primary) 12%, transparent);
  border-radius: 999px;
}

.form-demo__array-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-demo__array-item :deep(.varo-form-item__label) {
  font-weight: 700;
}

.form-demo__array-field--wide {
  grid-column: 1 / -1;
}

.form-demo__array-item :deep(.varo-form-item__control) {
  width: 100%;
}

.form-demo__array-secondary,
.form-demo__array-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 36px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 10px;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.form-demo__array-secondary {
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--varo-card-solid) 86%, transparent);
  border: 1px solid var(--varo-border);
}

.form-demo__array-remove {
  color: var(--varo-danger);
  background: color-mix(in srgb, var(--varo-danger) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--varo-danger) 18%, transparent);
}

.form-demo__array-secondary:hover {
  color: var(--varo-foreground);
  background: color-mix(in srgb, var(--varo-primary) 8%, var(--varo-card-solid));
  border-color: color-mix(in srgb, var(--varo-primary) 34%, var(--varo-border));
}

.form-demo__array-remove:hover {
  background: color-mix(in srgb, var(--varo-danger) 18%, transparent);
  border-color: color-mix(in srgb, var(--varo-danger) 36%, transparent);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .form-demo__array-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.form-demo__code-toggle {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 36px;
  padding: 0 12px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: color-mix(in srgb, var(--form-demo-surface-strong) 92%, transparent);
  border: 1px solid var(--form-demo-border);
  border-radius: 999px;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.form-demo__code-toggle:hover,
.form-demo__code-toggle[data-active='true'] {
  color: var(--varo-primary);
  background: color-mix(in srgb, var(--varo-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--varo-primary) 46%, transparent);
  transform: translateY(-1px);
}

.form-demo__code-icon {
  width: 16px;
  height: 16px;
}

.form-demo__code-toggle span {
  font-size: 12px;
  font-weight: 700;
}

.form-demo__code {
  margin-top: 12px;
  overflow: hidden;
  background: var(--form-demo-code-bg);
  border: 1px solid var(--form-demo-code-border);
  border-radius: 14px;
  box-shadow: 0 12px 28px color-mix(in srgb, #020617 22%, transparent);
}

.form-demo__code-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 0;
}

.form-demo__tabs {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  margin: 0;
  background: var(--form-demo-code-surface);
  border: 1px solid var(--form-demo-code-border);
  border-radius: 10px;
}

.form-demo__tab {
  min-height: 36px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--form-demo-code-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.form-demo__tab[data-active='true'] {
  color: var(--form-demo-code-text);
  background: #243247;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--varo-primary) 24%, transparent);
}

.form-demo__tab:hover:not([data-active='true']) {
  color: var(--form-demo-code-text);
  background: color-mix(in srgb, var(--varo-primary) 8%, transparent);
}

.form-demo__code-copy {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--form-demo-code-text);
  white-space: nowrap;
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--varo-primary) 38%, var(--form-demo-code-border));
  border-radius: 9px;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.form-demo__code-copy:hover {
  color: #fff;
  background: color-mix(in srgb, var(--varo-primary) 16%, transparent);
  border-color: color-mix(in srgb, var(--varo-primary) 72%, var(--form-demo-code-border));
}

.form-demo__code-copy[data-state='copied'] {
  color: #bbf7d0;
  background: color-mix(in srgb, #4ade80 18%, transparent);
  border-color: color-mix(in srgb, #4ade80 48%, transparent);
}

.form-demo__code-copy[data-state='unsupported'] {
  color: #fde68a;
  background: color-mix(in srgb, #fbbf24 14%, transparent);
  border-color: color-mix(in srgb, #fbbf24 48%, transparent);
}

.form-demo__code-copy-icon {
  position: relative;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
}

.form-demo__code-copy-icon::before,
.form-demo__code-copy-icon::after {
  position: absolute;
  width: 8px;
  height: 10px;
  content: '';
  border: 1.5px solid currentcolor;
  border-radius: 2px;
}

.form-demo__code-copy-icon::before {
  top: 0;
  right: 0;
}

.form-demo__code-copy-icon::after {
  bottom: 0;
  left: 0;
  background: currentcolor;
  opacity: 0.18;
}

.form-demo__code-copy-label {
  font-size: 12px;
  font-weight: 720;
  line-height: 1;
}

.form-demo__tab:focus-visible,
.form-demo__reopen:focus-visible,
.form-demo__array-add:focus-visible,
.form-demo__array-secondary:focus-visible,
.form-demo__array-remove:focus-visible,
.form-demo__code-toggle:focus-visible,
.form-demo__code-copy:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-primary) 70%, transparent);
  outline-offset: 2px;
}

.form-demo__code-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0;
  font-size: 13px;
  color: var(--form-demo-code-text);
}

.form-demo__code-head span {
  color: var(--form-demo-code-muted);
}

.form-demo__code pre {
  padding: 14px 16px 18px;
  margin: 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.65;
  color: var(--form-demo-code-text);
}

.form-demo__code code {
  font-family: var(--vp-font-family-mono);
}

.form-demo__code-toast {
  padding: 8px 16px;
  margin: 0;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.3;
  border-top: 1px solid var(--form-demo-code-border);
}

.form-demo__code-toast[data-state='copied'] {
  color: #bbf7d0;
  background: color-mix(in srgb, #4ade80 12%, transparent);
}

.form-demo__code-toast[data-state='unsupported'] {
  color: #fde68a;
  background: color-mix(in srgb, #fbbf24 12%, transparent);
}

:deep(.varo-checkbox-group),
:deep(.varo-radio-group) {
  display: grid;
  gap: 10px;
}

:deep(.varo-uploader__input) {
  display: none;
}

@media (max-width: 640px) {
  .form-demo__stage {
    padding: 14px;
    border-radius: calc(var(--varo-demo-radius) - 4px);
  }

  .form-demo__code-toolbar {
    align-items: stretch;
  }

  .form-demo__code-copy {
    width: 100%;
  }

  .form-demo__code-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

.form-demo__stage {
  border-color: var(--form-demo-border);
  border-radius: var(--varo-demo-radius);
}

.form-demo__array-item {
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  box-shadow: var(--varo-shadow-sm);
}

.form-demo__reopen,
.form-demo__array-add,
.form-demo__array-remove,
.form-demo__array-count,
.form-demo__array-badge,
.form-demo__array-secondary,
.form-demo__code-toggle,
.form-demo__code-copy {
  border-radius: 999px;
}

.form-demo__code,
.form-demo__tabs,
.form-demo__tab {
  border-radius: var(--varo-radius);
}

.form-demo__reopen,
.form-demo__array-add {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
  border-color: var(--varo-primary);
}

.form-demo__array-secondary,
.form-demo__array-count {
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
  border: 1px solid var(--varo-border);
}

.form-demo__array-badge {
  color: var(--varo-accent);
  background: var(--varo-card-muted);
}

.form-demo__array-remove {
  color: var(--varo-danger);
  background: var(--varo-danger-soft);
  border-color: color-mix(in srgb, var(--varo-danger) 22%, transparent);
}

.form-demo__code-toggle {
  color: var(--varo-muted);
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
}

.form-demo__code-toggle:hover,
.form-demo__code-toggle[data-active='true'] {
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
  border-color: var(--varo-border-strong);
}

.form-demo__tabs {
  background: color-mix(in srgb, var(--varo-card-solid) 8%, transparent);
}

.form-demo__tab[data-active='true'] {
  color: var(--varo-foreground);
  background: var(--varo-card-solid);
}

:deep(.varo-input__body),
:deep(.varo-calendar),
:deep(.varo-date-picker),
:deep(.varo-picker),
:deep(.varo-cascader),
:deep(.varo-number-keyboard),
:deep(.varo-calendar-card),
:deep(.varo-short-password__cells),
:deep(.varo-uploader__item),
:deep(.varo-uploader__trigger) {
  border-radius: var(--varo-radius);
}
</style>
