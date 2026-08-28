<script setup lang="ts">
import { useUserInfo } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '个人信息',
})

const fn = useUserInfo('User')

const { userInfo, oldUserInfo, handleChangeImg, handleDateChange, onSubmit, getEmailCode, getSmsCode, globalTip, smsForm, emailForm } = fn
</script>

<template>
  <AedToast
    has-mask
    :is-opened="globalTip.isOpened"
    :text="globalTip.message"
    :status="globalTip.status"
    :duration="5000"
  />

  <view class="center_info_wrap">
    <view class="image" @tap="handleChangeImg">
      <image
        v-if="userInfo.avatarUrl"
        class="avatar"
        :src="userInfo.avatarUrl"
      />
      <open-data v-else class="avatar" type="userAvatarUrl" />
    </view>
    <view class="form">
      <view>
        <VInput
          v-model:value="userInfo.nickName"
          label="昵称"
          :cursor="-1"
          type="text"
          placeholder="请输入昵称"
        />
        <VInput
          v-model:value="userInfo.realName"
          label="真实姓名"
          :cursor="-1"
          type="text"
          placeholder="请输入真实姓名"
        />
        <picker
          mode="date"
          :value="userInfo.birthDate"
          @change="handleDateChange"
        >
          <VInput
            label="出生日期"
            type="text"
            readonly
            :value="userInfo.birthDate"
            placeholder="请选择出生日期"
          />
        </picker>
        <VInput
          v-model:value="userInfo.phoneNumber"
          label="联系电话"
          :cursor="-1"
          type="phone"
          placeholder="请输入联系电话"
        />
        <VInput
          v-if="userInfo.phoneNumber !== oldUserInfo.phoneNumber"
          v-model:value="userInfo.smsCode"
          :cursor="-1"
          label="手机验证码"
          type="number"
          placeholder="请输入验证码"
        >
          <text
            v-if="smsForm.yzmText.indexOf('重发') == -1"
            class="smscode"
            @tap="getSmsCode"
          >
            {{ smsForm.yzmText }}
          </text>
          <text v-else class="smscode">
            {{ smsForm.yzmText }}
          </text>
        </VInput>
        <VInput
          v-model:value="userInfo.email"
          label="邮箱"
          :cursor="-1"
          type="text"
          placeholder="请输入邮箱"
        />
        <VInput
          v-if="userInfo.email && userInfo.email !== oldUserInfo.email"
          v-model:value="userInfo.emailCode"
          label="邮箱验证码"
          type="number"
          placeholder="请输入验证码"
        >
          <text
            v-if="emailForm.yzmText.indexOf('重发') == -1"
            class="smscode"
            @tap="getEmailCode"
          >
            {{ emailForm.yzmText }}
          </text>
          <text v-else class="smscode">
            {{ emailForm.yzmText }}
          </text>
        </VInput>
      </view>
      <view class="btn_wrap">
        <view class="submit" @tap="onSubmit">
          提交
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  .image {
    display: flex;
    justify-content: center;
    margin: 50px 0;
    .avatar {
      width: 206px;
      height: 206px;
      background: #fff;
      border-radius: 50%;
    }
  }
  .smscode {
    font-size: 27px !important;
    font-weight: 400;
    color: #e95513 !important;
  }
}
</style>
