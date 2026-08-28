<script setup lang="ts">
import { useCourseInfo } from '../../pages/college'

definePageJson({
  navigationBarTitleText: '培训课程详情',
})

const infoFn = useCourseInfo()

const { info, makePhoneCall, noDataFilter } = infoFn
</script>

<template>
  <view class="course_info">
    <AedFlex class-name="c_pad course_info_header">
      <view class="h-l">
        <image style="height: 100%; width: 100%" :src="info.imagePath" />
      </view>
      <AedFlexItem class-name="h-r">
        <view class="title">
          {{ info.name }}
        </view>
        <view class="m">
          <view class="m-col" style="flex: 0.5">
            <view class="top">
              总课时
            </view>
            <view class="num">
              {{ noDataFilter(info.classHour) }}h
            </view>
          </view>
          <view class="line" />
          <view class="m-col">
            <view class="top">
              课程人数
            </view>
            <view class="num">
              {{ noDataFilter(info.personNumber) }}
            </view>
          </view>
        </view>
      </AedFlexItem>
    </AedFlex>

    <view class="detail c_pad">
      <view class="title">
        课程信息
      </view>
      <view class="col">
        <view class="label">
          联系人：
        </view>
        <view class="content">
          {{ info.userName }}
        </view>
      </view>
      <view class="col" @tap="makePhoneCall(info.phoneNumber)">
        <view class="label">
          联系电话：
        </view>
        <view class="content" style="color: #1890ff">
          {{ info.phoneNumber }}
        </view>
      </view>
      <view class="col">
        <view class="label">
          价格：
        </view>
        <view class="content">
          {{ noDataFilter(info.price) }}
        </view>
      </view>
      <view v-if="info.url" class="col">
        <view class="label">
          报名网址：
        </view>
        <view class="content">
          {{ noDataFilter(info.url) }}
        </view>
      </view>
    </view>
    <!-- <view class="detail c_pad">
      <view class="title">授课信息</view>
      <view class="col">
        <view class="label"> 授课时间： </view>
        <view class="content">
          {{ dateFilter(info.classTime, "YYYY-MM-DD HH:mm") }}
        </view>
      </view>
      <view class="col">
        <view class="label"> 授课地址： </view>
        <view class="content">{{ info.classAddress }} </view>
      </view>
    </view> -->
    <view class="detail c_pad">
      <view class="title">
        课程简介
      </view>
      <view v-if="info.introduction" class="info">
        <rich-text :nodes="info.introduction" />
      </view>
      <view v-else class="info">
        {{ noDataFilter(info.introduction) }}
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.c_pad {
  padding: 0 48px;
  box-sizing: border-box;
}

.course_info {
  overflow: auto;
  height: 100%;

  &_header {
    padding-top: 32px;

    .h-l {
      width: 258px;
      height: 334px;
      border-radius: 25px;
      background: #e5e8f2;
    }

    .h-r {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 30px;
      white-space: initial;

      .title {
        word-break: break-all;
        font-size: 40px;
        font-weight: bold;
        color: #3e3a39;
      }

      .m {
        display: flex;

        .m-col {
          flex: 1;
          word-break: break-all;
          text-align: cemter;

          .top {
            margin-bottom: 18px;
            font-size: 32px;
            font-weight: 400;
          }

          .num {
            font-size: 34px;
            font-weight: 400;
            color: #fe4c17;
          }
        }

        .line {
          width: 4px;
          margin: 0 29px;
          background: #717071;
        }
      }
    }
  }

  .col {
    display: flex;
    margin-top: 25px;
    font-size: 28px;
    font-weight: 400;
    color: #717071;

    .content {
      flex: 1;
      word-break: break-all;
    }
  }

  .detail {
    margin-top: 75px;

    .title {
      font-size: 36px;
      font-weight: bold;
      color: #3e3a39;
      margin-bottom: 37px;
    }

    .info {
      margin-bottom: 50px;
      font-size: 30px;
      font-weight: 400;
      color: #727171;
      line-height: 42px;
      word-break: break-all;
    }
  }
}
</style>
