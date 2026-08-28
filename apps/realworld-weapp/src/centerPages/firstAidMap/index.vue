<script setup lang="ts">
import { CopyRight, provision, version } from '../../request/constants'

definePageJson({
  navigationBarTitleText: 'AED急救地图介绍',
})
</script>

<template>
  <view class="service_info">
    <view class="header">
      <image src="../../static/images/jx-logo.svg" />
      <view class="title">
        AED急救地图
      </view>
      <view class="version">
        {{ version }}
      </view>
    </view>
    <view class="aed-article">
      <view class="aed-article__content">
        <view class="aed-article__section">
          <view class="aed-article__p">
            AED急救地图是久心医疗科技（苏州）有限公司具有完全自主知识产权、面向社会公众、提供快速查找及维护AED的软件产品；主要向用户提供周边可用AED的快速查找及定位、急救联动、AED日常管理、急救知识公众普及等实用功能；致力于打造面向公共领域AED查找使用及维护的专业管理平台。
          </view>
        </view>
      </view>
    </view>
    <view class="footer">
      <view>{{ provision }}</view>
      <view>{{ CopyRight }}</view>
    </view>
  </view>
</template>

<style lang="scss">
.service_info {
  height: 100%;
  overflow: auto;
  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 90px 0;
    image {
      width: 150px;
      height: 150px;
      margin-bottom: 30px;
    }
    .title {
      margin-bottom: 10px;
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    .version {
      font-weight: 400;
      font-size: 26px;
      color: #333;
    }
  }
  .footer {
    position: absolute;
    width: 100%;
    bottom: 20px;
    text-align: center;
    font-size: 24px;
    color: #7d8fac;
  }
}
.aed-article__h3 {
  margin-top: 20px;
}
.aed-article__p {
  text-indent: 2em;
  font-size: 32px;
  line-height: 60px;
}
</style>
