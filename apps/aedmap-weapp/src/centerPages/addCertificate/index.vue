<script setup lang="ts">
import JxDot from '../../components/jxDot/index.vue'
import { useCertInfo } from '../../pages/myCenter'

definePageJson({
  navigationBarTitleText: '资质认证',
})

const fn = useCertInfo()

const { globalTip, uploadFrontImage, uploadBackImage, changeCertType, certList, certIndex, info, onSubmit, isCheckCer } = fn
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
    <view class="form">
      <view class="form_item">
        <view>
          <viewItem
            v-if="!isCheckCer"
            has-border
            title="证书类型"
            :extra-text="certList[certIndex].name"
            arrow="right"
          />
          <picker
            v-else
            mode="selector"
            :range="certList"
            range-key="name"
            :value="certIndex"
            @change="changeCertType"
          >
            <viewItem
              has-border
              title="证书类型"
              :extra-text="certList[certIndex].name"
              arrow="right"
            />
          </picker>
          <VInput
            v-model:value="info.volunteerName"
            :cursor="-1"
            label="真实姓名"
            type="text"
            :disabled="!isCheckCer"
            placeholder="请输入真实姓名"
          />
          <VInput
            v-model:value="info.awardingBody"
            :cursor="-1"
            label="颁发机构"
            type="text"
            :disabled="!isCheckCer"
            placeholder="请输入颁发机构"
          />
          <view v-if="info.auditState" class="list_item">
            <viewItem has-border title="审核状态" />
            <view class="item_dot">
              <JxDot :state="info.auditState" />
            </view>
          </view>
        </view>
        <view v-if="info.auditState == 'REJECT'" class="info_form_wrap">
          <AedFlex class-name="col" align="start">
            <view class="label">
              审核原因
            </view>
            <AedFlexItem class-name="content">
              <VInput
                v-model:value="info.description"
                type="textarea"
                :count="false"
                :disabled="true"
              />
            </AedFlexItem>
          </AedFlex>
        </view>
      </view>
      <view class="upload_wrap">
        <view class="header">
          上传证件正反面照片
        </view>
        <view class="upload">
          <view v-if="!isCheckCer" class="cert mr-40">
            <template v-if="!info.frontImagePath">
              <VIcon
                class="icon"
                name="add"
                size="40"
                color="#C8C9CA"
              />
              <text class="ft">
                证书正面
              </text>
            </template>
            <template v-else>
              <image
                style="height: 100%; width: 100%"
                :src="info.frontImagePath"
              />
            </template>
          </view>
          <view v-else class="cert mr-40" @tap="uploadFrontImage">
            <template v-if="!info.frontImagePath">
              <VIcon
                class="icon"
                name="add"
                size="40"
                color="#C8C9CA"
              />
              <text class="ft">
                证书正面
              </text>
            </template>
            <template v-else>
              <image
                style="height: 100%; width: 100%"
                :src="info.frontImagePath"
              />
            </template>
          </view>

          <view v-if="!isCheckCer" class="cert">
            <template v-if="!info.backImagePath">
              <VIcon
                class="icon"
                name="add"
                size="40"
                color="#C8C9CA"
              />
              <text class="ft">
                证书背面
              </text>
            </template>
            <template v-else>
              <image
                style="height: 100%; width: 100%"
                :src="info.backImagePath"
              />
            </template>
          </view>
          <view v-else class="cert" @tap="uploadBackImage">
            <template v-if="!info.backImagePath">
              <VIcon
                class="icon"
                name="add"
                size="40"
                color="#C8C9CA"
              />
              <text class="ft">
                证书背面
              </text>
            </template>
            <template v-else>
              <image
                style="height: 100%; width: 100%"
                :src="info.backImagePath"
              />
            </template>
          </view>
        </view>
      </view>
    </view>
    <view class="standard">
      <view class="standard_header">
        上传证书规范
      </view>
      <AedFlex>
        <AedFlexItem class-name="mr-14">
          <view class="standard_item">
            <view class="image">
              <image
                style="width: 100%; height: 100%"
                src="../../static/images/normal.jpg"
              />
            </view>
            <view class="text">
              <VIcon
                class="icon"
                name="cert-check"
                color="#21CF3C"
              />
              <text class="ft">
                标准
              </text>
            </view>
          </view>
        </AedFlexItem>
        <AedFlexItem class-name="mr-14">
          <view class="standard_item">
            <view class="image">
              <image
                style="width: 100%; height: 100%"
                src="../../static/images/shelter.jpg"
              />
            </view>
            <view class="text">
              <VIcon
                class="icon"
                name="cert-wrong"
                color="#E73828"
              />
              <text class="ft">
                遮挡
              </text>
            </view>
          </view>
        </AedFlexItem>
        <AedFlexItem class-name="mr-14">
          <view class="standard_item">
            <view class="image">
              <image
                style="width: 100%; height: 100%"
                src="../../static/images/vague.jpg"
              />
            </view>
            <view class="text">
              <VIcon
                class="icon"
                name="cert-wrong"
                color="#E73828"
              />
              <text class="ft">
                模糊
              </text>
            </view>
          </view>
        </AedFlexItem>
        <AedFlexItem>
          <view class="standard_item">
            <view class="image">
              <image
                style="width: 100%; height: 100%"
                src="../../static/images/flash.jpg"
              />
            </view>
            <view class="text">
              <VIcon
                class="icon"
                name="cert-wrong"
                color="#E73828"
              />
              <text class="ft">
                闪光
              </text>
            </view>
          </view>
        </AedFlexItem>
      </AedFlex>
      <view class="standard_tip">
        温馨提示：带有发证日期或有效日期为证书正面,上传证书时能够清楚显示姓名和有效日期，并且图片放正，
        否则会影响证书能否通过审核。
      </view>
    </view>
    <view class="btn_wrap">
      <!-- @tap="onSubmit" -->
      <view v-if="!info.auditState" class="submit" @tap="onSubmit">
        上传认证
      </view>
      <view
        v-if="info.auditState == 'REJECT' || info.expired"
        class="submit"
        @tap="onSubmit"
      >
        重新认证
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.center_info_wrap {
  display: flex;
  flex-direction: column;
  .mr-40 {
    margin-right: 40px;
  }
  .mr-14 {
    margin-right: 14px;
  }

  .form {
    flex: 1;
    overflow: auto;
    .varo-input {
      margin-left: 24px;
    }
    .upload_wrap {
      margin-top: 27px;
      margin-bottom: 28px;
      .header {
        font-size: 32px;
        margin-bottom: 28px;
        margin-left: 24px;
      }
      .upload {
        display: flex;
        justify-content: center;
        .cert {
          height: 245px;
          width: 245px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          flex-direction: column;
          .ft {
            margin-top: 20px;
            font-size: 30px;
            font-weight: 400;
            color: #c8c9ca;
          }
        }
      }
    }
    &_item {
      .list_item {
        position: relative;
        .item_dot {
          display: flex;
          align-items: center;
          position: absolute;
          top: 50%;
          right: 24px;
          transform: translateY(-50%);
        }
      }
    }
  }
  .standard {
    padding: 30px 34px 35px 24px;
    background: #fff;
    box-sizing: border-box;
    &_header {
      font-size: 32px;
      margin-bottom: 28px;
    }
    &_item {
      display: flex;
      flex-direction: column;
      align-items: center;
      .image {
        width: 161px;
        height: 161px;
        background: #dbdcdc;
      }
      .text {
        display: flex;
        align-items: center;
        margin-top: 30px;
        .icon {
          font-size: 26px !important;
        }
        .ft {
          margin-left: 10px;
          font-size: 26px;
        }
      }
    }
    &_tip {
      margin-top: 30px;
      font-size: 26px;
      font-weight: 400;
      color: #e73828;
    }
  }
  .btn_wrap {
    margin: 30px 0;
  }
}
</style>
