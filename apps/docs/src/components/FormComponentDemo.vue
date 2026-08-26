<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, useId } from 'vue'
import {
  VButton,
  VCalendar,
  VCalendarCard,
  VCascader,
  VCheckbox,
  VCheckboxGroup,
  VDatePicker,
  VForm,
  VFormItem,
  VInput,
  VInputNumber,
  VLoading,
  VNumberKeyboard,
  VPicker,
  VRadio,
  VRadioGroup,
  VRange,
  VRate,
  VSearchbar,
  VSelect,
  VShortPassword,
  VSwitch,
  VTextarea,
  VToast,
  VUploader
} from '@varo/ui-h5'

type FormDemoKind =
  | 'calendar'
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
    locale: 'zh'
  }
)

const codeExpanded = ref(false)
const activePlatform = ref<Platform>('h5')
const copyState = ref<'idle' | 'copied' | 'unsupported'>('idle')
let copyFeedbackTimer: number | undefined
const checkboxValue = ref(['apple'])
const radioValue = ref('wechat')
const selectValue = ref<string | number>('hangzhou')
const switchValue = ref(true)
const toastVisible = ref(true)
const inputNumberValue = ref(2)
const rateValue = ref(3)
const rangeValue = ref(40)
const searchValue = ref('Varo')
const textareaValue = ref('Textarea content')
const formModel = reactive({
  account: '',
  budget: 40,
  contact: '',
  email: '',
  files: [] as Array<{ name: string; status?: 'ready' | 'uploading' | 'done' | 'failed' }>,
  gender: '',
  interests: [] as string[],
  password: '',
  quantity: 1,
  remark: '',
  score: 0
})
const formArrayModel = reactive({
  companies: [{ name: '', contact: '', phone: '', type: '' }]
})
const primaryCompanyIndex = ref(0)
const calendarValue = ref('2026-05-14')
const cascaderValue = ref<Array<string | number>>(['zhejiang'])
const pickerValue = ref<string | number>('apple')
const shortPasswordValue = ref('123')
const uploaderFiles = ref([
  { name: 'avatar.png', progress: 100, status: 'done' as const, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80' },
  { name: 'contract.pdf', progress: 64, status: 'uploading' as const }
])
const calendarVisible = ref(true)
const cascaderVisible = ref(true)
const datePickerVisible = ref(true)
const numberKeyboardVisible = ref(true)
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
    { min: 3, trigger: changeTrigger }
  ],
  budget: { min: 50, trigger: changeTrigger },
  contact: [
    { required: true, trigger: [changeTrigger, blurTrigger] },
    { length: 11, trigger: blurTrigger }
  ],
  email: [
    { required: true, trigger: [changeTrigger, blurTrigger] },
    { email: true, trigger: blurTrigger }
  ],
  files: { required: true, trigger: changeTrigger },
  gender: { required: true, trigger: changeTrigger },
  interests: { required: true, trigger: changeTrigger },
  password: [
    { required: true, trigger: changeTrigger },
    { length: 6, trigger: changeTrigger }
  ],
  quantity: { min: 2, trigger: changeTrigger },
  remark: [
    { required: true, trigger: [changeTrigger, blurTrigger] },
    { max: 80, trigger: blurTrigger }
  ],
  score: { min: 1, trigger: changeTrigger }
}
const formArrayRules = computed(() =>
  Object.fromEntries(
    formArrayModel.companies.flatMap((_, index) => [
      [
        `companies.${index}.name`,
        [
          { required: true, trigger: changeTrigger },
          { min: 2, trigger: changeTrigger }
        ]
      ],
      [
        `companies.${index}.contact`,
        [{ required: true, trigger: changeTrigger }]
      ],
      [
        `companies.${index}.phone`,
        [
          { required: true, trigger: [changeTrigger, blurTrigger] },
          { length: 11, trigger: blurTrigger }
        ]
      ],
      [
        `companies.${index}.type`,
        [{ required: true, trigger: changeTrigger }]
      ]
    ])
  )
)

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
        toastMessage: 'Saved successfully',
        toastShow: 'Show Toast',
        loadingText: 'Loading',
        textareaPlaceholder: 'Enter content',
        keyboardDone: 'Done',
        keyboardDelete: 'Delete',
        reopen: 'Open',
        save: 'Save',
        saveFailed: 'Save failed',
        saveSuccess: 'Saved',
        account: 'Username',
        contact: 'Phone',
        email: 'Email',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        interests: 'Interests',
        design: 'Design',
        develop: 'Development',
        quantity: 'Quantity',
        score: 'Rate',
        budget: 'Budget',
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
        password: 'Password',
        remark: 'Remark'
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
        toastMessage: '保存成功',
        toastShow: '显示 Toast',
        loadingText: '加载中',
        textareaPlaceholder: '请输入内容',
        keyboardDone: '完成',
        keyboardDelete: '删除',
        reopen: '打开',
        save: '保存',
        saveFailed: '保存失败',
        saveSuccess: '保存成功',
        account: '用户名',
        contact: '手机号',
        email: '邮箱',
        gender: '性别',
        male: '男',
        female: '女',
        interests: '兴趣',
        design: '设计',
        develop: '研发',
        quantity: '数量',
        score: '评分',
        budget: '预算',
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
        password: '短密码',
        remark: '备注'
      }
)

const cascaderOptions = computed(() =>
  props.locale === 'en'
    ? [
        {
          label: 'Zhejiang',
          value: 'zhejiang',
          children: [
            { label: 'Hangzhou', value: 'hangzhou' },
            { label: 'Ningbo', value: 'ningbo' }
          ]
        },
        {
          label: 'Jiangsu',
          value: 'jiangsu',
          children: [
            { label: 'Nanjing', value: 'nanjing' },
            { label: 'Suzhou', value: 'suzhou' }
          ]
        }
      ]
    : [
        {
          label: '浙江',
          value: 'zhejiang',
          children: [
            { label: '杭州', value: 'hangzhou' },
            { label: '宁波', value: 'ningbo' }
          ]
        },
        {
          label: '江苏',
          value: 'jiangsu',
          children: [
            { label: '南京', value: 'nanjing' },
            { label: '苏州', value: 'suzhou' }
          ]
        }
      ]
)

const pickerColumns = computed(() =>
  props.locale === 'en'
    ? [
        { label: 'Apple', value: 'apple' },
        { label: 'Pear', value: 'pear' },
        { label: 'Orange', value: 'orange' }
      ]
    : [
        { label: '苹果', value: 'apple' },
        { label: '梨', value: 'pear' },
        { label: '橙子', value: 'orange' }
      ]
)

const selectOptions = computed(() =>
  props.locale === 'en'
    ? [
        { label: 'Shanghai', value: 'shanghai' },
        { label: 'Hangzhou', value: 'hangzhou' },
        { label: 'Shenzhen', value: 'shenzhen' }
      ]
    : [
        { label: '上海', value: 'shanghai' },
        { label: '杭州', value: 'hangzhou' },
        { label: '深圳', value: 'shenzhen' }
      ]
)

const platformPackage = computed(() => (activePlatform.value === 'h5' ? '@varo/ui-h5' : '@varo/ui-weapp'))
const packageTag = computed(() => (activePlatform.value === 'h5' ? '@varo/ui-h5' : '@varo/ui-weapp'))

function codeFor(packageName: string) {
  const isEn = props.locale === 'en'

  switch (props.example) {
    case 'calendar':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VCalendar } from '${packageName}'

const visible = ref(true)
const date = ref('2026-05-14')
<\/script>

<template>
  <VCalendar
    v-model:visible="visible"
    v-model:value="date"
    month="2026-05"
    confirm-text="${copy.value.confirm}"
    @confirm="onConfirm"
  />
</template>
      `.trim()
    case 'calendar-card':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VCalendarCard } from '${packageName}'

const date = ref('2026-05-14')
<\/script>

<template>
  <VCalendarCard v-model:value="date" month="2026-05" />
</template>
      `.trim()
    case 'cascader':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VCascader } from '${packageName}'

const visible = ref(true)
const value = ref(['zhejiang'])
const options = ${isEn ? "[{ label: 'Zhejiang', value: 'zhejiang', children: [{ label: 'Hangzhou', value: 'hangzhou' }] }]" : "[{ label: '浙江', value: 'zhejiang', children: [{ label: '杭州', value: 'hangzhou' }] }]"}
<\/script>

<template>
  <VCascader v-model:visible="visible" v-model:value="value" title="${copy.value.cityTitle}" :options="options" />
</template>
      `.trim()
    case 'checkbox':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VCheckbox, VCheckboxGroup } from '${packageName}'

const fruits = ref(['apple'])
<\/script>

<template>
  <VCheckboxGroup v-model:value="fruits" :max="2">
    <VCheckbox label="${isEn ? 'Apple' : '苹果'}" value="apple" />
    <VCheckbox label="${isEn ? 'Pear' : '梨'}" value="pear" />
    <VCheckbox label="${isEn ? 'Orange' : '橙子'}" value="orange" />
  </VCheckboxGroup>
</template>
      `.trim()
    case 'date-picker':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker } from '${packageName}'

const visible = ref(true)
const date = ref('2026-05-14')
<\/script>

<template>
  <VDatePicker v-model:visible="visible" v-model:value="date" month="2026-05" />
</template>
      `.trim()
    case 'form':
      return `
<script setup lang="ts">
import { reactive } from 'vue'
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
import { computed, reactive } from 'vue'
import { VButton, VForm, VFormItem, VInput, VRadio, VRadioGroup } from '${packageName}'

const model = reactive({
  companies: [{ name: '', contact: '', phone: '', type: '' }]
})
const rules = computed(() =>
  Object.fromEntries(
    model.companies.flatMap((_, index) => [
      [
        \`companies.\${index}.name\`,
        [
          { required: true, trigger: 'change' },
          { min: 2, trigger: 'change' }
        ]
      ],
      [
        \`companies.\${index}.contact\`,
        [{ required: true, trigger: 'change' }]
      ],
      [
        \`companies.\${index}.phone\`,
        [
          { required: true, trigger: ['change', 'blur'] },
          { length: 11, trigger: 'blur' }
        ]
      ],
      [
        \`companies.\${index}.type\`,
        [{ required: true, trigger: 'change' }]
      ]
    ])
  )
)

function addCompany() {
  model.companies.push({ name: '', contact: '', phone: '', type: '' })
}

function removeCompany(index: number) {
  model.companies.splice(index, 1)
}
<\/script>

<template>
  <VForm id="company-form" :model="model" :rules="rules">
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
import { ref } from 'vue'
import { VInputNumber } from '${packageName}'

const count = ref(2)
<\/script>

<template>
  <VInputNumber v-model:value="count" :min="1" :max="5" />
</template>
      `.trim()
    case 'number-keyboard':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VNumberKeyboard } from '${packageName}'

const visible = ref(true)
<\/script>

<template>
  <VNumberKeyboard
    :visible="visible"
    extra-key="."
    @input="onInput"
    @delete="onDelete"
    @close="visible = false"
  />
</template>
      `.trim()
    case 'picker':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VPicker } from '${packageName}'

const visible = ref(true)
const value = ref('apple')
const columns = ${isEn ? "[{ label: 'Apple', value: 'apple' }, { label: 'Pear', value: 'pear' }]" : "[{ label: '苹果', value: 'apple' }, { label: '梨', value: 'pear' }]"}
<\/script>

<template>
  <VPicker v-model:visible="visible" v-model:value="value" title="${copy.value.fruitTitle}" :columns="columns" />
</template>
      `.trim()
    case 'radio':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VRadio, VRadioGroup } from '${packageName}'

const payType = ref('wechat')
<\/script>

<template>
  <VRadioGroup v-model:value="payType">
    <VRadio label="${isEn ? 'WeChat Pay' : '微信'}" value="wechat" />
    <VRadio label="${isEn ? 'Alipay' : '支付宝'}" value="alipay" />
  </VRadioGroup>
</template>
      `.trim()
    case 'range':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VRange } from '${packageName}'

const value = ref(40)
<\/script>

<template>
  <VRange v-model:value="value" :step="10" />
</template>
      `.trim()
    case 'rate':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VRate } from '${packageName}'

const value = ref(3)
<\/script>

<template>
  <VRate v-model:value="value" />
</template>
      `.trim()
    case 'searchbar':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VSearchbar } from '${packageName}'

const keyword = ref('Varo')
<\/script>

<template>
  <VSearchbar v-model:value="keyword" placeholder="${copy.value.searchPlaceholder}" @search="onSearch" />
</template>
      `.trim()
    case 'short-password':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VShortPassword } from '${packageName}'

const password = ref('123')
<\/script>

<template>
  <VShortPassword v-model:value="password" @complete="onComplete" />
</template>
      `.trim()
    case 'textarea':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VTextarea } from '${packageName}'

const value = ref('')
<\/script>

<template>
  <VTextarea v-model:value="value" placeholder="${copy.value.textareaPlaceholder}" />
</template>
      `.trim()
    case 'uploader':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VUploader } from '${packageName}'

const files = ref([
  { name: 'avatar.png', progress: 100, status: 'done', url: 'https://example.com/avatar.png' },
  { name: 'contract.pdf', progress: 64, status: 'uploading' }
])
<\/script>

<template>
  <VUploader v-model:value="files" accept="image/*" list-type="card" upload-text="${copy.value.upload}" />
</template>
      `.trim()
    case 'select':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from '${packageName}'

const city = ref<string | number>('hangzhou')
const options = ${isEn ? "[{ label: 'Shanghai', value: 'shanghai' }, { label: 'Hangzhou', value: 'hangzhou' }, { label: 'Shenzhen', value: 'shenzhen' }]" : "[{ label: '上海', value: 'shanghai' }, { label: '杭州', value: 'hangzhou' }, { label: '深圳', value: 'shenzhen' }]"}
<\/script>

<template>
  <VSelect v-model:value="city" mode="dropdown" :options="options" placeholder="${copy.value.selectPlaceholder}" clearable />
</template>
      `.trim()
    case 'switch':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from '${packageName}'

const enabled = ref(true)
<\/script>

<template>
  <VSwitch v-model="enabled" />
  <VSwitch v-model="enabled" disabled />
</template>
      `.trim()
    case 'toast':
      return `
<script setup lang="ts">
import { ref } from 'vue'
import { VToast } from '${packageName}'

const visible = ref(true)
<\/script>

<template>
  <VToast v-model:visible="visible" type="success" message="${copy.value.toastMessage}" />
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
    default:
      return ''
  }
}

const activeCode = computed(() => codeFor(platformPackage.value))
const codeToggleLabel = computed(() =>
  codeExpanded.value ? copy.value.codeCollapse : copy.value.codeExpand
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
  } else if (primaryCompanyIndex.value >= formArrayModel.companies.length) {
    primaryCompanyIndex.value = Math.max(0, formArrayModel.companies.length - 1)
  }
}

function setPrimaryCompany(index: number) {
  primaryCompanyIndex.value = index
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
    <div class="form-demo__stage">
      <span class="form-demo__label">{{ copy.preview }}</span>

      <div class="form-demo__preview" :data-example="example">
        <VCheckboxGroup v-if="example === 'checkbox'" v-model:value="checkboxValue" :max="2">
          <VCheckbox :label="locale === 'en' ? 'Apple' : '苹果'" value="apple" />
          <VCheckbox :label="locale === 'en' ? 'Pear' : '梨'" value="pear" />
          <VCheckbox :label="locale === 'en' ? 'Orange' : '橙子'" value="orange" />
        </VCheckboxGroup>

        <VRadioGroup v-else-if="example === 'radio'" v-model:value="radioValue">
          <VRadio :label="locale === 'en' ? 'WeChat Pay' : '微信'" value="wechat" />
          <VRadio :label="locale === 'en' ? 'Alipay' : '支付宝'" value="alipay" />
        </VRadioGroup>

        <VInputNumber v-else-if="example === 'input-number'" v-model:value="inputNumberValue" :min="1" :max="5" />
        <VRate v-else-if="example === 'rate'" v-model:value="rateValue" />
        <VRange v-else-if="example === 'range'" v-model:value="rangeValue" :step="10" />
        <VSearchbar
          v-else-if="example === 'searchbar'"
          v-model:value="searchValue"
          :placeholder="copy.searchPlaceholder"
          :action-text="copy.cancel"
        />
        <VTextarea v-else-if="example === 'textarea'" v-model:value="textareaValue" :placeholder="copy.textareaPlaceholder" />
        <VShortPassword v-else-if="example === 'short-password'" v-model:value="shortPasswordValue" />
        <VSelect
          v-else-if="example === 'select'"
          v-model:value="selectValue"
          mode="dropdown"
          :options="selectOptions"
          :placeholder="copy.selectPlaceholder"
          clearable
        />
        <div v-else-if="example === 'switch'" class="form-demo__switch-row">
          <VSwitch v-model="switchValue" />
          <VSwitch v-model="switchValue" disabled />
        </div>
        <div v-else-if="example === 'loading'" class="form-demo__loading-row">
          <VLoading :text="copy.loadingText" />
          <VLoading size="sm" tone="primary" />
          <VLoading size="lg" tone="success" />
        </div>
        <VToast
          v-else-if="example === 'toast'"
          v-model:visible="toastVisible"
          type="success"
          :message="copy.toastMessage"
        />
        <VUploader
          v-else-if="example === 'uploader'"
          v-model:value="uploaderFiles"
          accept="image/*"
          list-type="card"
          :upload-text="copy.upload"
        />

        <VForm
          v-else-if="example === 'form'"
          :id="formId"
          class="form-demo__save"
          :model="formModel"
          :rules="formRules"
          @failed="onFormFailed"
          @submit="onFormSubmit"
        >
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

          <VFormItem name="gender" :label="copy.gender" required>
            <template #default="{ setValue, value }">
              <VRadioGroup :value="value.value as string" direction="horizontal" @update:value="setValue">
                <VRadio :label="copy.male" value="male" />
                <VRadio :label="copy.female" value="female" />
              </VRadioGroup>
            </template>
          </VFormItem>

          <VFormItem name="interests" :label="copy.interests" required>
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

          <VFormItem name="budget" :label="copy.budget" required>
            <template #default="{ setValue, value }">
              <VRange :value="value.value as number" :step="10" @update:value="setValue" />
            </template>
          </VFormItem>

          <VFormItem name="password" :label="copy.password" required>
            <template #default="{ setValue, value }">
              <VShortPassword :value="value.value as string" @update:value="setValue" />
            </template>
          </VFormItem>

          <VFormItem name="remark" :label="copy.remark" required>
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

          <VFormItem name="files" :label="copy.upload" required>
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
            :rules="formArrayRules"
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

        <VCalendarCard
          v-else-if="example === 'calendar-card'"
          v-model:value="calendarValue"
          month="2026-05"
          min-date="2026-05-10"
          max-date="2026-05-20"
        />
        <VCalendar
          v-else-if="example === 'calendar'"
          v-model:visible="calendarVisible"
          v-model:value="calendarValue"
          month="2026-05"
          :confirm-text="copy.confirm"
        />
        <VDatePicker
          v-else-if="example === 'date-picker'"
          v-model:visible="datePickerVisible"
          v-model:value="calendarValue"
          month="2026-05"
          :confirm-text="copy.confirm"
        />
        <VCascader
          v-else-if="example === 'cascader'"
          v-model:visible="cascaderVisible"
          v-model:value="cascaderValue"
          :title="copy.cityTitle"
          :confirm-text="copy.confirm"
          :cancel-text="copy.cancel"
          :options="cascaderOptions"
          @cancel="cascaderVisible = false"
        />
        <VPicker
          v-else-if="example === 'picker'"
          v-model:visible="pickerVisible"
          v-model:value="pickerValue"
          :title="copy.fruitTitle"
          :confirm-text="copy.confirm"
          :cancel-text="copy.cancel"
          :columns="pickerColumns"
          @cancel="pickerVisible = false"
        />
        <VNumberKeyboard
          v-else-if="example === 'number-keyboard'"
          :visible="numberKeyboardVisible"
          extra-key="."
          :close-text="copy.keyboardDone"
          :delete-text="copy.keyboardDelete"
          @close="numberKeyboardVisible = false"
        />

        <button
          v-if="example === 'calendar' && !calendarVisible"
          class="form-demo__reopen"
          type="button"
          @click="calendarVisible = true"
        >
          {{ copy.reopen }}
        </button>
        <button
          v-if="example === 'date-picker' && !datePickerVisible"
          class="form-demo__reopen"
          type="button"
          @click="datePickerVisible = true"
        >
          {{ copy.reopen }}
        </button>
        <button
          v-if="example === 'cascader' && !cascaderVisible"
          class="form-demo__reopen"
          type="button"
          @click="cascaderVisible = true"
        >
          {{ copy.reopen }}
        </button>
        <button
          v-if="example === 'picker' && !pickerVisible"
          class="form-demo__reopen"
          type="button"
          @click="pickerVisible = true"
        >
          {{ copy.reopen }}
        </button>
        <button
          v-if="example === 'number-keyboard' && !numberKeyboardVisible"
          class="form-demo__reopen"
          type="button"
          @click="numberKeyboardVisible = true"
        >
          {{ copy.reopen }}
        </button>
        <button
          v-if="example === 'toast' && !toastVisible"
          class="form-demo__reopen"
          type="button"
          @click="toastVisible = true"
        >
          {{ copy.toastShow }}
        </button>
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
          <span class="form-demo__code-copy-icon" aria-hidden="true"></span>
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
  --form-demo-code-bg: var(--varo-demo-code-bg);
  position: relative;
  margin: 20px 0 28px;
}

.form-demo__stage {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--form-demo-border);
  border-radius: var(--varo-demo-radius);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--form-demo-surface) 94%, transparent), var(--form-demo-surface-strong)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--varo-primary) 10%, transparent), transparent 36%);
  box-shadow: var(--form-demo-shadow);
}

.form-demo__label {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

.form-demo__preview {
  display: grid;
  gap: 12px;
  min-height: 88px;
  align-items: start;
}

.form-demo__preview[data-example='select'] {
  overflow: visible;
  padding-bottom: 8px;
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
  border: 1px solid var(--form-demo-border);
  border-radius: 20px;
  background: var(--varo-demo-phone-screen);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--varo-card-solid) 18%, transparent),
    0 14px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.form-demo__preview[data-example='toast'] {
  min-height: 148px;
  align-items: center;
  justify-content: center;
  padding: 18px;
  border: 1px solid var(--form-demo-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--form-demo-surface-strong) 88%, transparent);
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
  width: fit-content;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--varo-primary) 38%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--varo-primary) 10%, transparent);
  color: var(--varo-primary);
  cursor: pointer;
  font-weight: 700;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.form-demo__reopen:hover,
.form-demo__array-add:hover {
  border-color: color-mix(in srgb, var(--varo-primary) 56%, transparent);
  background: color-mix(in srgb, var(--varo-primary) 16%, transparent);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--varo-primary) 14%, transparent);
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
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

.form-demo__array-count {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-muted) 12%, transparent);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
}

.form-demo__array-item {
  padding: 14px;
  border: 1px solid var(--varo-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--varo-surface-strong) 72%, transparent);
}

.form-demo__array-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
  min-height: 24px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-primary) 12%, transparent);
  color: var(--varo-primary);
  font-size: 11px;
  font-weight: 800;
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
  min-width: 72px;
  min-height: 36px;
  padding: 0 12px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.form-demo__array-secondary {
  border: 1px solid var(--varo-border);
  background: color-mix(in srgb, var(--varo-card-solid) 86%, transparent);
  color: var(--vp-c-text-2);
}

.form-demo__array-remove {
  border: 1px solid color-mix(in srgb, var(--varo-danger) 18%, transparent);
  background: color-mix(in srgb, var(--varo-danger) 12%, transparent);
  color: var(--varo-danger);
}

.form-demo__array-secondary:hover {
  border-color: color-mix(in srgb, var(--varo-primary) 34%, var(--varo-border));
  background: color-mix(in srgb, var(--varo-primary) 8%, var(--varo-card-solid));
  color: var(--varo-foreground);
}

.form-demo__array-remove:hover {
  border-color: color-mix(in srgb, var(--varo-danger) 36%, transparent);
  background: color-mix(in srgb, var(--varo-danger) 18%, transparent);
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
  min-height: 36px;
  height: auto;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--form-demo-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--form-demo-surface-strong) 92%, transparent);
  color: var(--vp-c-text-2);
  padding: 0 12px;
  cursor: pointer;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.form-demo__code-toggle:hover,
.form-demo__code-toggle[data-active='true'] {
  border-color: color-mix(in srgb, var(--varo-primary) 46%, transparent);
  background: color-mix(in srgb, var(--varo-primary) 10%, transparent);
  color: var(--varo-primary);
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
  border: 1px solid var(--form-demo-border);
  border-radius: 18px;
  background: var(--form-demo-code-bg);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--varo-foreground) 10%, transparent);
}

.form-demo__code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 12px 0;
}

.form-demo__tabs {
  display: inline-flex;
  gap: 6px;
  margin: 0;
  padding: 4px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--varo-border-strong) 40%, transparent);
}

.form-demo__tab {
  min-height: 36px;
  border: 0;
  border-radius: 9px;
  padding: 0 14px;
  background: transparent;
  color: color-mix(in srgb, var(--varo-card-solid) 72%, transparent);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.form-demo__tab[data-active='true'] {
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--varo-foreground) 12%, transparent);
}
.form-demo__tab:hover:not([data-active='true']) {
  color: color-mix(in srgb, var(--varo-card-solid) 92%, transparent);
  background: color-mix(in srgb, var(--varo-card-solid) 10%, transparent);
}

.form-demo__code-copy {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid color-mix(in srgb, var(--varo-card-solid) 18%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-card-solid) 8%, transparent);
  color: color-mix(in srgb, var(--varo-card-solid) 82%, transparent);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.form-demo__code-copy:hover {
  border-color: color-mix(in srgb, var(--varo-primary) 42%, transparent);
  background: color-mix(in srgb, var(--varo-primary) 16%, transparent);
  color: color-mix(in srgb, var(--varo-card-solid) 96%, transparent);
}

.form-demo__code-copy[data-state='copied'] {
  border-color: color-mix(in srgb, #4ade80 48%, transparent);
  background: color-mix(in srgb, #4ade80 18%, transparent);
  color: #bbf7d0;
}

.form-demo__code-copy[data-state='unsupported'] {
  border-color: color-mix(in srgb, #fbbf24 48%, transparent);
  background: color-mix(in srgb, #fbbf24 14%, transparent);
  color: #fde68a;
}

.form-demo__code-copy-icon {
  position: relative;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
}

.form-demo__code-copy-icon::before,
.form-demo__code-copy-icon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 10px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
}

.form-demo__code-copy-icon::before {
  top: 0;
  right: 0;
}

.form-demo__code-copy-icon::after {
  bottom: 0;
  left: 0;
  background: currentColor;
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px 0;
  color: color-mix(in srgb, var(--varo-card-solid) 88%, transparent);
  font-size: 13px;
}

.form-demo__code-head span {
  color: color-mix(in srgb, var(--varo-card-solid) 52%, transparent);
}

.form-demo__code pre {
  margin: 0;
  padding: 14px 16px 18px;
  overflow-x: auto;
  color: color-mix(in srgb, var(--varo-card-solid) 92%, var(--varo-surface-strong));
  font-size: 13px;
  line-height: 1.65;
}

.form-demo__code code {
  font-family: var(--vp-font-family-mono);
}

.form-demo__code-toast {
  margin: 0;
  border-top: 1px solid color-mix(in srgb, #fff 10%, transparent);
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.3;
}

.form-demo__code-toast[data-state='copied'] {
  background: color-mix(in srgb, #4ade80 12%, transparent);
  color: #bbf7d0;
}

.form-demo__code-toast[data-state='unsupported'] {
  background: color-mix(in srgb, #fbbf24 12%, transparent);
  color: #fde68a;
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
    align-items: flex-start;
    flex-direction: column;
  }
}

.form-demo__stage {
  border-color: var(--form-demo-border);
  border-radius: var(--varo-demo-radius);
}

.form-demo__array-item {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card-solid);
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
  border-color: var(--varo-primary);
  background: var(--varo-primary);
  color: var(--varo-primary-foreground);
}

.form-demo__array-secondary,
.form-demo__array-count {
  border: 1px solid var(--varo-border);
  background: var(--varo-card-muted);
  color: var(--varo-foreground);
}

.form-demo__array-badge {
  background: var(--varo-card-muted);
  color: var(--varo-accent);
}

.form-demo__array-remove {
  border-color: color-mix(in srgb, var(--varo-danger) 22%, transparent);
  background: var(--varo-danger-soft);
  color: var(--varo-danger);
}

.form-demo__code-toggle {
  border-color: var(--varo-border);
  background: var(--varo-card-solid);
  color: var(--varo-muted);
}

.form-demo__code-toggle:hover,
.form-demo__code-toggle[data-active='true'] {
  border-color: var(--varo-border-strong);
  background: var(--varo-card-muted);
  color: var(--varo-foreground);
}

.form-demo__tabs {
  background: color-mix(in srgb, var(--varo-card-solid) 8%, transparent);
}

.form-demo__tab[data-active='true'] {
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
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
