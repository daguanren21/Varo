<script setup lang="ts">
import { useCourseList } from '..'

const courseFn = useCourseList()
function goDocs() {
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

const { busList, hahList, otherList, busCount, ahaCount, otherCount, goToInfo, goToList, dateFilter, makePhoneCall } = courseFn
</script>

<template>
  <view class="course_list" style="line-height:30px">
    <!-- <view style="padding-top: 10px;">
      南宁市培训咨询联系方式
      请关注如下南宁急救医疗中心官方网站、微信公众号和抖音号。
    </view>
    <view style="margin-top: 10px;">
      1. 南宁急救医疗中心官方网站：

         http://www.nnjj120.com
    </view>
    <view style="margin-top: 10px;">
      2. 微信公众号：“南宁急救医疗中心”服务号，“南宁120急救中心”订阅号
    </view>
    <view style="margin-top: 10px;">
      3. 抖音号：nnjj120
    </view>
    <image style="margin-top: 10px;" mode="aspectFit" src="@/static/images/nanningDy.png" /> -->
    <!-- <AedNoticeBar icon='volume-plus'>
      公益急救培训进企业活动(当前已开放上海市、苏州市，其他区域陆续开放中...)
      <text @tap="goDocs" style="color: #ff6216; text-decoration: underline;">点击报名</text>
    </AedNoticeBar> -->
    <view class="header">
      公益急救培训进企业
    </view>
    <view style="margin-top: -18px;font-size: 12px;color: #333;">
      当前已开放上海市、苏州市，其他区域陆续开放中...
    </view>
    <view class="content">
      <image
        class="doc-image" src="https://shanghaiaedobs.obs.cn-east-3.myhuaweicloud.com/test/images/2f492692-e3f0-4c33-a084-460a47f96f26.png" style="width: 100%;"
        @tap="goDocs"
      />
    </view>
    <view class="header">
      AHA授证培训
      <text v-if="ahaCount > 2" style="color: #ff6216" @tap="goToList('AHA')">
        更多
      </text>
    </view>
    <view class="content">
      <AedFlex v-if="hahList.length" justify="between">
        <AedFlexItem v-for="item in hahList" :key="item.id" class-name="item" :size="6" @tap="goToInfo(item.id)">
          <view class="image">
            <image style="width: 100%; height: 100%" :src="item.imagePath" />
          </view>
          <view class="title">
            {{ item.name }}
          </view>
          <view class="time">
            {{ dateFilter(item.startTime, "YYYY-MM-DD") }}
          </view>
          <view class="phone" @tap.stop="makePhoneCall(item.phoneNumber)">
            <text class="name ft">
              {{ item.userName }}
            </text>
            <VIcon class="icon ml-20" name="course-phone" size="20" />
            <text class="ft" style="color: #1890ff">
              {{ item.phoneNumber }}
            </text>
          </view>
        </AedFlexItem>
      </AedFlex>
      <view v-else class="noData">
        <image class="img" src="../../../static/images/jx-without-aed.svg" />
        <text class="ft">
          暂无AHA培训课程
        </text>
      </view>
    </view>
    <view class="header">
      企业客户团课
      <text v-if="busCount > 2" style="color: #ff6216" @tap="goToList('BUSINESS')">
        更多
      </text>
    </view>
    <view class="content">
      <AedFlex v-if="busList.length" justify="between">
        <AedFlexItem v-for="item in busList" :key="item.id" class-name="item" :size="6" @tap="goToInfo(item.id)">
          <view class="image">
            <image style="width: 100%; height: 100%" :src="item.imagePath" />
          </view>
          <view class="title">
            {{ item.name }}
          </view>
          <view class="time">
            {{ dateFilter(item.startTime, "YYYY-MM-DD HH:mm") }}
          </view>
          <view class="phone" @tap.stop="makePhoneCall(item.phoneNumber)">
            <text class="name ft">
              {{ item.userName }}
            </text>
            <VIcon class="icon ml-20" name="course-phone" size="20" />
            <text class="ft" style="color: #1890ff">
              {{ item.phoneNumber }}
            </text>
          </view>
        </AedFlexItem>
      </AedFlex>
      <view v-else class="noData">
        <image class="img" src="../../../static/images/jx-without-aed.svg" />
        <text class="ft">
          暂无企业客户课程
        </text>
      </view>
    </view>
    <view class="header">
      其他课程
      <text v-if="otherCount > 2" style="color: #ff6216" @tap="goToList('OTHER')">
        更多
      </text>
    </view>
    <view class="content">
      <AedFlex v-if="otherList.length" justify="between">
        <AedFlexItem v-for="item in otherList" :key="item.id" class-name="item" :size="6" @tap="goToInfo(item.id)">
          <view class="image">
            <image style="width: 100%; height: 100%" :src="item.imagePath" />
          </view>
          <view class="title">
            {{ item.name }}
          </view>
          <view class="time">
            {{ dateFilter(item.startTime, "YYYY-MM-DD HH:mm") }}
          </view>
          <view class="phone" @tap.stop="makePhoneCall(item.phoneNumber)">
            <text class="name ft">
              {{ item.userName }}
            </text>
            <VIcon class="icon ml-20" name="course-phone" size="20" />
            <text class="ft" style="color: #1890ff">
              {{ item.phoneNumber }}
            </text>
          </view>
        </AedFlexItem>
      </AedFlex>
      <view v-else class="noData">
        <image class="img" src="../../../static/images/jx-without-aed.svg" />
        <text class="ft">
          暂无其他培训课程
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.index {
  .course_list {
    height: 100%;
    padding: 0 30px;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 25px 0;
      font-size: 32px;
      font-weight: bold;
      color: #3e3a39;
    }

    .content {
      padding-bottom: 30px;
      border-bottom: 2px solid #e5e8f2;
      min-height: 260px;
      width: 100%;

      .item {
        padding: 0 5px;

        .image {
          width: 100%;
          height: 180px;
          background: #e5e8f2;
          border-radius: 15px;
        }

        .title {
          font-size: 30px;
          font-weight: 400;
          color: #727171;
          margin-top: 17px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .time {
          font-size: 26px;
          font-weight: 400;
          color: #727171;
          margin-top: 20px;
        }

        .phone {
          margin-top: 20rpx;
          display: flex;
          align-items: center;

          .icon {
            color: #ff6216;
          }

          .name {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .ft {
            font-size: 26px;
            font-weight: 400;
            color: #727171;
          }
        }
      }
    }
  }
}
</style>
