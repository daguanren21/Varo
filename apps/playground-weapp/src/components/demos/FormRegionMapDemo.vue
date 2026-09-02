<script setup lang="ts">
import type { VaroMapMarker } from '../ui/map.types'
import type { VaroRegionOption, VaroRegionSelection, VaroRegionShortcut } from '../ui/region-picker.types'
import { computed, reactive, shallowRef } from 'wevu'
import markerIcon from '../../assets/map/region-marker.png'
import { VForm, VFormItem } from '../ui/form'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VInput from '../ui/v-input.vue'
import VMap from '../ui/v-map.vue'
import VRegionPicker from '../ui/v-region-picker.vue'

const regionOptions: VaroRegionOption[] = [
  {
    label: '中国',
    value: 'cn',
    children: [
      {
        label: '浙江省',
        value: 'zhejiang',
        children: [
          {
            label: '杭州市',
            value: 'hangzhou',
            children: [
              { label: '西湖区', value: 'xihu', latitude: 30.259, longitude: 120.13 },
              { label: '滨江区', value: 'binjiang', latitude: 30.208, longitude: 120.212 },
            ],
          },
        ],
      },
      {
        label: '上海市',
        value: 'shanghai',
        children: [
          { label: '浦东新区', value: 'pudong', latitude: 31.221, longitude: 121.544 },
          { label: '徐汇区', value: 'xuhui', latitude: 31.188, longitude: 121.436 },
        ],
      },
    ],
  },
  {
    label: '海外',
    value: 'overseas',
    children: [
      {
        label: '新加坡',
        value: 'singapore',
        children: [
          { label: '中央区', value: 'central', latitude: 1.29, longitude: 103.852 },
        ],
      },
    ],
  },
]

const shortcuts: VaroRegionShortcut[] = [
  { label: '杭州西湖', path: ['cn', 'zhejiang', 'hangzhou', 'xihu'] },
  { label: '上海浦东', path: ['cn', 'shanghai', 'pudong'] },
  { label: '新加坡', path: ['overseas', 'singapore', 'central'] },
]

const model = reactive({
  nickName: '',
  phoneNumber: '',
  email: '',
  regionPath: [] as Array<string | number>,
  regionLabel: '',
  detailAddress: '',
  feedback: '',
  latitude: 30.259,
  longitude: 120.13,
})
const regionVisible = shallowRef(false)
const submitResult = shallowRef('')
const rules = {
  nickName: [
    { required: true, message: '请输入昵称' },
    { min: 2, message: '昵称至少 2 个字符' },
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号' },
    { pattern: '^1\\d{10}$', message: '请输入正确手机号' },
  ],
  email: { email: true, message: '请输入正确邮箱' },
  regionPath: { required: true, message: '请选择活动区域' },
  detailAddress: { required: true, message: '请输入详细地址' },
  feedback: [
    { required: true, message: '请输入反馈内容' },
    { max: 200, message: '反馈内容最多 200 个字符' },
  ],
}
const regionDisplay = computed(() => model.regionLabel || '请选择活动区域')
const markers = computed<VaroMapMarker[]>(() => [{
  id: 1,
  latitude: model.latitude,
  longitude: model.longitude,
  iconPath: markerIcon,
  width: 28,
  height: 28,
  callout: {
    content: model.regionLabel || '当前选择',
    display: 'ALWAYS',
    padding: 6,
    borderRadius: 8,
  },
}])

function confirmRegion(selection: VaroRegionSelection) {
  model.regionLabel = selection.labels.join(' / ')
  if (selection.latitude !== undefined) { model.latitude = selection.latitude }
  if (selection.longitude !== undefined) { model.longitude = selection.longitude }
}
function submit() {
  submitResult.value = `已提交：${model.nickName} · ${model.regionLabel}`
}

function failed(payload: unknown) {
  const errors = (payload as { errors?: Record<string, string> } | undefined)?.errors ?? {}
  submitResult.value = errors.nickName ?? Object.values(errors)[0] ?? '请检查表单'
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] p-3 pb-10 text-slate-950">
    <view class="mb-3 grid gap-1 rounded-2xl bg-slate-950 p-4 text-white">
      <text class="text-lg font-black">
        Varo Form · Region · Map
      </text>
      <text class="text-xs text-slate-300">
        从 Realworld 提取的独立业务表单，不依赖原应用接口。
      </text>
    </view>

    <VForm :model="model" :rules="rules" @submit="submit" @failed="failed">
      <VCard class-name="mb-3" variant="outline">
        <view class="mb-3 grid gap-1">
          <text class="text-base font-black">
            个人资料
          </text>
          <text class="text-xs text-slate-500">
            字段规则、错误信息与原生提交。
          </text>
        </view>
        <VFormItem name="nickName" label="昵称">
          <VInput v-model:value="model.nickName" placeholder="请输入昵称" clearable />
        </VFormItem>
        <VFormItem name="phoneNumber" label="手机号">
          <VInput v-model:value="model.phoneNumber" type="tel" placeholder="请输入手机号" />
        </VFormItem>
        <VFormItem name="email" label="邮箱">
          <VInput v-model:value="model.email" placeholder="选填" />
        </VFormItem>
      </VCard>

      <VCard class-name="mb-3" variant="outline">
        <view class="mb-3 grid gap-1">
          <text class="text-base font-black">
            活动地点
          </text>
          <text class="text-xs text-slate-500">
            层级地区选择会直接更新地图中心和标记。
          </text>
        </view>
        <VFormItem name="regionPath" label="活动区域">
          <VButton block variant="outline" tone="default" @click="regionVisible = true">
            {{ regionDisplay }}
          </VButton>
        </VFormItem>
        <VFormItem name="detailAddress" label="详细地址">
          <VInput v-model:value="model.detailAddress" placeholder="楼栋、门牌等" />
        </VFormItem>
        <VMap
          map-id="formShowcaseMap"
          class-name="mt-3"
          :latitude="model.latitude"
          :longitude="model.longitude"
          :markers="markers"
          :enable-scroll="false"
          :enable-zoom="false"
          :scale="14"
          height="220px"
          aria-label="已选活动区域地图"
          :show-location="false"
        />
      </VCard>

      <VCard class-name="mb-3" variant="outline">
        <VFormItem name="feedback" label="反馈内容">
          <VInput
            v-model:value="model.feedback"
            type="textarea"
            :max-length="200"
            show-word-limit
            placeholder="请输入反馈内容"
          />
        </VFormItem>
      </VCard>

      <VButton block size="lg" native-type="submit">
        提交表单
      </VButton>
      <view class="mt-3 min-h-10 rounded-xl bg-white p-3 text-xs text-slate-600" role="status">
        {{ submitResult || '填写后提交，错误会显示在对应字段下方。' }}
      </view>
    </VForm>

    <VRegionPicker
      v-model:visible="regionVisible"
      v-model="model.regionPath"
      :options="regionOptions"
      :shortcuts="shortcuts"
      title="选择活动区域"
      @confirm="confirmRegion"
    />
  </view>
</template>
