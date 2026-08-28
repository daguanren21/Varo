<script setup lang="ts">
import { useUserInfo } from '.'
import JxTitle from '../../components/jxTitle/index.vue'
import { useGolbalData } from '../../hooks'

definePageJson({
  navigationBarTitleText: '个人中心',
  navigationBarBackgroundColor: '#FCEFE6',
  backgroundTextStyle: 'light',
  navigationStyle: 'custom',
  enableShareTimeline: true,
})

const userFn = useUserInfo()
const { isVolunteer } = useGolbalData()

const { userInfo, linkTo, auditCerFilter, serviceList, unReadNum } = userFn
</script>

<template>
  <view class="index">
    <JxTitle title="个人中心" />
    <view v-if="isVolunteer" class="my">
      <view class="my_header my_p16">
        <AedFlex>
          <AedFlexItem class-name="ml-16" :size="3">
            <view class="avatar_wrap">
              <image
                v-if="userInfo.avatarUrl"
                class="avatar"
                mode="aspectFill"
                :src="userInfo.avatarUrl"
              />
              <open-data v-else class="avatar" type="userAvatarUrl" />
            </view>
          </AedFlexItem>
          <AedFlexItem class-name="user_info">
            <view class="user">
              <view class="name">
                <text v-if="userInfo.nickName">
                  {{ userInfo.nickName }}
                </text>
                <open-data v-else type="userNickName" />
              </view>
              <view
                class="check"
                :style="{ backgroundColor: auditCerFilter(userInfo)?.dot }"
              >
                {{ auditCerFilter(userInfo)?.state }}
              </view>
            </view>
            <view class="address">
              {{ userInfo.mainMomentAreaAddress }}
            </view>
          </AedFlexItem>
        </AedFlex>
      </view>
      <view class="my_grid my_p16">
        <view class="header">
          个人中心
        </view>
        <AedGrid
          :has-border="false"
          :data="[
            {
              key: 'editUserInfo',
              iconInfo: { value: 'person-info' },
              value: '账号信息修改',
            },
            {
              key: 'addCertificate',
              iconInfo: { value: 'certification' },
              value: '资质认证',
            },
            {
              key: 'honorInfo',
              iconInfo: { value: 'honor-info' },
              value: '荣誉信息',
            },
            {
              key: 'integralInfo',
              iconInfo: { value: 'point-center' },
              value: '积分中心',
            },
            {
              key: 'editAddress',
              iconInfo: { value: 'act-center' },
              value: '活动地点',
            },
            {
              key: 'inspectionRecord',
              iconInfo: { value: 'xunjian' },
              value: '我的巡检',
            },
            {
              key: 'repairRecord',
              iconInfo: { value: 'baoxiu' },
              value: '我的报修',
            },
          ]"
          @click="linkTo"
        />
      </view>
      <view class="my_grid my_p16">
        <view class="header">
          服务中心
        </view>
        <!-- <AedGrid
          @click="linkTo"
          :hasBorder="false"
          :data="[
            {
              key: 'questionNaire',
              iconInfo: { value: 'question-look' },
              value: '问卷调查',
            },
            {
              key: 'customer',
              iconInfo: { value: 'customer-center' },
              value: '客服中心',
            },
            {
              key: 'notification',
              iconInfo: { value: 'message-notice' },
              value: '消息通知',
            },
            {
              key: 'feedBack',
              iconInfo: { value: 'feedback' },
              value: '意见反馈',
            },
            {
              key: 'firstAidMap',
              iconInfo: { value: 'my-aedmap' },
              value: 'AED急救地图',
            },
            {
              key: 'serviceAgreement',
              iconInfo: { value: 'service-agree' },
              value: '服务协议',
            },
          ]"
        /> -->
        <AedFlex wrap="wrap">
          <AedFlexItem
            v-for="(item, index) in serviceList"
            :key="item.key"
            :size="4"
            @tap="linkTo(item)"
          >
            <view class="center_col">
              <VBadge v-if="index == 2 && unReadNum" :content="unReadNum">
                <VIcon :name="item.iconInfo.value" />
              </VBadge>
              <VIcon
                v-else
                :name="item.iconInfo.value"
              />
              <text class="ft">
                {{ item.value }}
              </text>
            </view>
          </AedFlexItem>
        </AedFlex>
      </view>
      <view class="my_grid my_p16">
        <view class="header">
          配置中心
        </view>
        <AedGrid
          :has-border="false"
          :data="[
            {
              key: 'wifiConfig',
              iconInfo: { value: 'my-wifi' },
              value: '一键配网',
            },
            {
              key: 'noticeConfig',
              iconInfo: { value: 'notificationSettings' },
              value: '通知配置',
            },
          ]"
          @click="linkTo"
        />
      </view>
    </view>
    <template v-else>
      <view class="content noData" style="background: #fff">
        <image class="img" src="../../static/images/jx-without-aed.svg" />
        <text class="ft">
          注册志愿者后可见
        </text>
      </view>
    </template>
  </view>
</template>

<style lang="scss">
.my_p16 {
  margin: 0 16px;
}
.ml-16 {
  margin-left: 16px;
}
.my {
  flex: 1;
  background: #fcefe6;
  overflow: auto;
  &_header {
    .avatar_wrap {
      display: flex;
      .avatar {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        overflow: hidden;
      }
    }

    .user_info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 15px;
      white-space: initial;
      .user {
        display: flex;
        align-items: center;
        .name {
          font-size: 37px;
          font-weight: bold;
          color: #231815;
          word-break: break-all;
        }
        .check {
          width: 150px;
          height: 40px;
          margin-left: 20px;
          font-size: 24px;
          font-weight: 400;
          color: #ffffff;
          border-radius: 30px;
          text-align: center;
          line-height: 40px;
          background: #21cf3c;
        }
      }
      .address {
        margin-top: 26px;
        font-size: 26px;
        font-weight: 400;
        color: #231815;
        word-break: break-all;
      }
    }
  }
  &_grid {
    margin-top: 20px;
    padding-bottom: 20px;
    background: #fff;
    border-radius: 30px;
    .header {
      padding-top: 36px;
      margin-left: 30px;
      margin-bottom: 40px;
      font-size: 36px;
      font-weight: bold;
      color: #595757;
    }
    .aed-legacy-grid__flex .aed-legacy-grid-item--square::before {
      padding-bottom: 150px;
    }
  }
}
.center_col {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 150px;
  justify-content: center;
  .ft {
    display: block;
    margin-top: 12px;
  }
}
</style>
