<script setup lang="ts">
import { useFeedBack } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '意见反馈',
})

const fn = useFeedBack()

const { feedbackTypeList, imageUrls, feedbackIndex, feedBackModel, globalTip, handleChange, onSubmit, handleChangeImg } = fn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />

  <view class="manage_form">
    <view>
      <view class="list_item">
        <view>
          <picker
            mode="selector"
            :range="feedbackTypeList"
            range-key="name"
            :value="feedbackIndex"
            @change="handleChange"
          >
            <viewItem
              has-border
              arrow="right"
              title="反馈类型"
              :extra-text="feedbackTypeList[feedbackIndex].name"
            />
          </picker>
        </view>
      </view>
      <view class="form_item">
        <view class="label">
          反馈内容
        </view>
        <VInput
          v-model:value="feedBackModel.content"
          type="textarea"
          :max-length="200"
          placeholder="请输入您的内容"
        />
      </view>
      <view class="form_item">
        <view class="label">
          添加照片
        </view>
        <AedUploader
          :files="imageUrls"
          multiple
          mode="aspectFit"
          :show-add-btn="imageUrls.length !== 4"
          :length="4"
          :count="4"
          @change="handleChangeImg"
        />
        <!-- <view class="tip" style="color:#595757"> 需上传4张 </view> -->
      </view>

      <VInput
        v-model:value="feedBackModel.userName"
        :cursor="-1"
        label="联系人"
        type="text"
        placeholder="请输入联系人"
      />
      <VInput
        v-model:value="feedBackModel.phoneNumber"
        :cursor="-1"
        label="联系方式"
        type="phone"
        placeholder="请输入联系方式"
      />
    </view>
    <view class="btn_wrap">
      <AedFlex justify="center">
        <AedFlexItem :size="5">
          <VButton class="save" shape="round" @click="onSubmit">
            提交
          </VButton>
        </AedFlexItem>
      </AedFlex>
    </view>
  </view>
</template>

<style lang="scss">
</style>
