<script setup lang="ts">
import { computed, ref } from 'wevu'
import JxTitle from '../../components/jxTitle/index.vue'

definePageJson({
  navigationBarTitleText: '想要AED',
  backgroundTextStyle: 'light',
  navigationStyle: 'custom',
})

const type = ref('1')
// const method = ref('')
// const handleChangeType = (val: string) => {
//   type.value = val
//   method.value = ''
//   val === '2' && (method.value = '2')
// }

function handleChangeMethod(val: string) {
  type.value = val
  if (val === '3') {
    wx.navigateToMiniProgram({
      appId: 'wxd45c635d754dbf59', // 腾讯文档小程序 AppID
      // path: '/page/modal/form?docId=DSFdoUkhJWkZYek1B&from=singlemessage', // 打开表单页
      path: 'pages/detail/detail?url=https://docs.qq.com/form/page/DSFdoUkhJWkZYek1B',
      envVersion: 'release',
      success(res: WechatMiniprogram.IAnyObject) {
        console.log('成功打开腾讯文档表单', res)
      },
      fail(err) {
        console.error('跳转失败', err)
      },
    })
  }
  else {
    toJousingShop()
  }
}
// const btnText = computed(() => {
//   if (type.value === '1' || method.value === '2') {
//     return '领取AED地图专享福利'
//   }
//   if (method.value === '1') {
//     return '选择租赁服务'
//   }
// })
const shopPath = computed(() => {
  if (type.value === '1') {
    return 'packages/user/coupon/detail/index?id=34710592&alias=pajixqgw&type=promocard&sign=2b4f8d71de38f9e11e39ff718d888dc6&shopAutoEnter=1'
  }
  if (type.value === '2') {
    return 'packages/goods/detail/index?alias=1yfn1dvbfy0yq87&shopAutoEnter=1'
  }
  if (type.value === '3') {
    return 'packages/goods/detail/index?alias=2g4i1v9v7ka9u7z&shopAutoEnter=1'
  }
  // if (type.value === '2') {
  //   return 'packages/user/coupon/detail/index?id=31688140&alias=1gbx3d8ci&type=promocard&sign=4d55a15f9208a6fa41a312821b901da5&shopAutoEnter=1'
  // }
})
function toJousingShop() {
  wx.navigateToMiniProgram({
    appId: 'wxadd853581285bbe1',
    path: shopPath.value,
  })
}
function toIndex() {
  wx.switchTab({
    url: '/pages/index/index',
  })
}
</script>

<template>
  <view class="page">
    <view class="doc-header">
      <JxTitle title="想要AED">
        <template #before>
          <VIcon class="icon return" name="chevron-left" size="30" color="#fff" @click="toIndex()" />
        </template>
      </JxTitle>
    </view>
    <view class="doc-body">
      <view class="doc-content">
        <image class="doc-image" src="../../static/images/person.png" @tap="handleChangeMethod('1')" />
        <image
          class="doc-image" src="../../static/images/company.jpg" style="margin-top: 25rpx;"
          @tap="handleChangeMethod('2')"
        />
        <image
          class="doc-image" src="https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/test/images/2f492692-e3f0-4c33-a084-460a47f96f26.png" style="margin-top: 25rpx;"
          @tap="handleChangeMethod('3')"
        />
      </view>

      <!-- <view class="doc-type">
        <view class="doc-title">购买类型</view>
        <view class="doc-radio" :class="{ 'selected': type === '1' }" @tap="handleChangeType('1')">
          <view class="radio-content">
            <view class="radio-content_left">
              <image src="../../static/images/shop/one.png" class="radio-icon"></image>
              <view class="radio-text">个人</view>
            </view>
            <view class="radio-content_right" v-if="type === '1'">
              <image src="../../static/images/shop/check.png" class="check-icon"></image>
            </view>
          </view>
        </view>
        <view class="doc-radio" :class="{ 'selected': type === '2' }" @tap="handleChangeType('2')">
          <view class="radio-content">
            <view class="radio-content_left">
              <image src="../../static/images/shop/two.png" class="radio-icon"></image>
              <view class="radio-text">公司</view>
            </view>
            <view class="radio-content_right" v-if="type === '2'">
              <image src="../../static/images/shop/check.png" class="check-icon"></image>
            </view>
          </view>
        </view>
      </view>
      <view class="doc-type" style="margin-top: 90rpx;" v-if="type === '2'">
        <view class="doc-title">采购方式</view>
        <view class="doc-radio" :class="{ 'selected': method === '1' }" @tap="handleChangeMethod('1')">
          <view class="radio-content">
            <view class="radio-content_left">
              <image src="../../static/images/shop/three.png" class="radio-icon"></image>
              <view class="radio-text">租赁</view>
              <view class="radio-desc">低至2148元/年</view>
            </view>
            <view class="radio-content_right" v-if="method === '1'">
              <image src="../../static/images/shop/check.png" class="check-icon"></image>
            </view>
          </view>
        </view>
        <view class="doc-radio" :class="{ 'selected': method === '2' }" @tap="handleChangeMethod('2')">
          <view class="radio-content">
            <view class="radio-content_left">
              <image src="../../static/images/shop/four.png" class="radio-icon"></image>
              <view class="radio-text">购买</view>
            </view>
            <view class="radio-content_right" v-if="method === '2'">
              <image src="../../static/images/shop/check.png" class="check-icon"></image>
            </view>
          </view>
        </view>
      </view>
      <view class="doc-submit" @tap="toJousingShop">
        {{ btnText }}
      </view> -->
      <!-- <view class='panel'>
        <view class='panel__title'>购买类型</view>
        <view class='panel__content no-padding'>
          <view class='component-item'>
            <AedRadio :options="[{ label: '个人', value: '1' }, {
              label: '企业', value: '2'
            }]" :value="type" @click="handleChangeType" />
          </view>
        </view>
      </view>
      <view class='panel' v-if="type === '2'">
        <view class='panel__title'>采购方式</view>
        <view class='panel__content no-padding'>
          <view class='component-item'>
            <AedRadio :options="[{ label: '租赁', value: '1', desc: '低至2148/年' }, {
              label: '购买', value: '2'
            }]" :value="method" @click="handleChangeMethod" />
          </view>
        </view>
      </view>
      <view class='component-item__btn-group'>
        <view class='component-item__btn-group__btn-item'>
          <VButton type='primary' @click="toJousingShop">
            {{ btnText }}
          </VButton>
        </view>
      </view> -->
    </view>
  </view>
</template>

<style lang="scss" src="./index.scss"></style>
