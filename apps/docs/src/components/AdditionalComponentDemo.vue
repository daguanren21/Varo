<script setup lang="ts">
import { VBreadcrumb, VButton, VDrawer, VInputOtp } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'
import ComponentPlatformDemo from './ComponentPlatformDemo.vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'

const props = withDefaults(defineProps<{
  component: 'input-otp' | 'drawer' | 'breadcrumb'
  locale?: 'zh' | 'en'
}>(), { locale: 'zh' })

const en = computed(() => props.locale === 'en')
const copy = computed(() => en.value
  ? {
      basic: 'Basic usage',
      otpLabel: 'One-time password',
      otpHint: 'Enter a 6-digit code, such as 012345.',
      notEntered: 'Not entered',
      complete: 'Complete',
      mask: 'Masking and separators',
      maskLabel: 'Masked one-time password',
      validation: 'Validation',
      validationLabel: '4-digit one-time password',
      states: 'States',
      readonly: 'Read only',
      readonlyLabel: 'Read-only one-time password',
      disabled: 'Disabled',
      disabledLabel: 'Disabled one-time password',
      openDrawer: 'Open drawer',
      filters: 'Filters',
      drawerHint: 'The drawer keeps the current page context visible.',
      placement: 'Placement and overlay',
      openLeft: 'Open left drawer',
      openBottom: 'Open bottom drawer',
      leftContent: 'Left content',
      bottomContent: 'Bottom content',
      close: 'Close',
      clickable: 'Clickable ancestors',
      custom: 'Custom separator and content',
      disabledAncestor: 'Disabled ancestor',
      breadcrumbLabel: 'Breadcrumb',
      breadcrumbItems: ['Home', 'Orders', 'Detail'],
      selected: 'Selected',
    }
  : {
      basic: '基础用法',
      otpLabel: '一次性验证码',
      otpHint: '请输入 6 位验证码，例如 012345。',
      notEntered: '尚未输入',
      complete: '输入完成',
      mask: '掩码与分隔符',
      maskLabel: '掩码验证码',
      validation: '校验',
      validationLabel: '4 位验证码',
      states: '状态',
      readonly: '只读',
      readonlyLabel: '只读验证码',
      disabled: '禁用',
      disabledLabel: '禁用验证码',
      openDrawer: '打开抽屉',
      filters: '筛选条件',
      drawerHint: '抽屉内容保持在当前页面上下文中。',
      placement: '方向与遮罩',
      openLeft: '打开左侧抽屉',
      openBottom: '打开底部抽屉',
      leftContent: '左侧内容',
      bottomContent: '底部内容',
      close: '关闭',
      clickable: '可点击层级',
      custom: '自定义分隔符与内容',
      disabledAncestor: '禁用层级',
      breadcrumbLabel: '面包屑',
      breadcrumbItems: ['首页', '订单', '详情'],
      selected: '已选择',
    })

const otpValue = shallowRef('')
const maskedOtpValue = shallowRef('')
const validationOtpValue = shallowRef('')
const completedOtp = shallowRef('')
const otpMessage = computed(() => completedOtp.value
  ? `${copy.value.complete}：${completedOtp.value}`
  : `${otpValue.value.length}/6 · ${otpValue.value || copy.value.notEntered}`)

function updateOtp(value: string) {
  otpValue.value = value
  completedOtp.value = ''
}

const drawerOpen = shallowRef(false)
const leftDrawerOpen = shallowRef(false)
const bottomDrawerOpen = shallowRef(false)

const breadcrumbItems = computed(() => copy.value.breadcrumbItems.map((label, index) => ({
  label,
  value: String(index),
})))
const disabledBreadcrumbItems = computed(() => breadcrumbItems.value.map((item, index) => ({
  ...item,
  disabled: index === 1,
})))
const breadcrumbSelection = shallowRef<number>()
const breadcrumbMessage = computed(() => breadcrumbSelection.value === undefined
  ? ''
  : `${copy.value.selected}：${copy.value.breadcrumbItems[breadcrumbSelection.value]}`)

function selectBreadcrumb(payload: { index: number }) {
  breadcrumbSelection.value = payload.index
}
</script>

<template>
  <ComponentPlatformDemo :component="component" :locale="locale">
    <div class="additional-component-demo" :data-docs-component="component">
      <DocsDeviceFrame v-if="component === 'input-otp'">
        <section class="additional-component-demo__section" data-docs-case="basic">
          <h3>{{ copy.basic }}</h3>
          <p class="additional-component-demo__hint">
            {{ copy.otpHint }}
          </p>
          <div class="additional-component-demo__otp">
            <VInputOtp
              :value="otpValue"
              :input-aria-label="copy.otpLabel"
              @update:value="updateOtp"
              @complete="completedOtp = $event"
            />
          </div>
          <output class="additional-component-demo__value" data-docs-state="otp" aria-live="polite">{{ otpMessage }}</output>
        </section>
        <section class="additional-component-demo__section" data-docs-case="mask-separator">
          <h3>{{ copy.mask }}</h3>
          <div class="additional-component-demo__otp">
            <VInputOtp v-model:value="maskedOtpValue" :input-aria-label="copy.maskLabel" mask separator="·" />
          </div>
        </section>
        <section class="additional-component-demo__section" data-docs-case="validation">
          <h3>{{ copy.validation }}</h3>
          <div class="additional-component-demo__otp">
            <VInputOtp v-model:value="validationOtpValue" :input-aria-label="copy.validationLabel" :length="4" pattern="[0-9]" invalid />
          </div>
        </section>
        <section class="additional-component-demo__section" data-docs-case="states">
          <h3>{{ copy.states }}</h3>
          <div class="additional-component-demo__state" data-docs-state="readonly">
            <p class="additional-component-demo__hint">
              {{ copy.readonly }}
            </p>
            <div class="additional-component-demo__otp">
              <VInputOtp value="012345" :input-aria-label="copy.readonlyLabel" readonly />
            </div>
          </div>
          <div class="additional-component-demo__state" data-docs-state="disabled">
            <p class="additional-component-demo__hint">
              {{ copy.disabled }}
            </p>
            <div class="additional-component-demo__otp">
              <VInputOtp value="012345" :input-aria-label="copy.disabledLabel" disabled />
            </div>
          </div>
        </section>
      </DocsDeviceFrame>

      <DocsDeviceFrame v-else-if="component === 'drawer'" overflow>
        <section class="additional-component-demo__section" data-docs-case="basic">
          <h3>{{ copy.basic }}</h3>
          <div class="additional-component-demo__row">
            <VButton class="docs-drawer-open" @click="drawerOpen = true">
              {{ copy.openDrawer }}
            </VButton>
          </div>
          <VDrawer v-model:open="drawerOpen" closeable>
            <div class="additional-component-demo__drawer-content">
              <h2>{{ copy.filters }}</h2>
              <p>{{ copy.drawerHint }}</p>
            </div>
          </VDrawer>
        </section>
        <section class="additional-component-demo__section" data-docs-case="placement">
          <h3>{{ copy.placement }}</h3>
          <div class="additional-component-demo__row">
            <VButton class="docs-drawer-left-open" @click="leftDrawerOpen = true">
              {{ copy.openLeft }}
            </VButton>
            <VButton class="docs-drawer-bottom-open" @click="bottomDrawerOpen = true">
              {{ copy.openBottom }}
            </VButton>
          </div>
          <VDrawer v-model:open="leftDrawerOpen" placement="left" round>
            <div class="additional-component-demo__drawer-content">
              <h2>{{ copy.leftContent }}</h2>
              <VButton @click="leftDrawerOpen = false">
                {{ copy.close }}
              </VButton>
            </div>
          </VDrawer>
          <VDrawer v-model:open="bottomDrawerOpen" placement="bottom" :close-on-click-overlay="false">
            <div class="additional-component-demo__drawer-content">
              <h2>{{ copy.bottomContent }}</h2>
              <VButton class="docs-drawer-bottom-close" @click="bottomDrawerOpen = false">
                {{ copy.close }}
              </VButton>
            </div>
          </VDrawer>
        </section>
      </DocsDeviceFrame>

      <DocsDeviceFrame v-else-if="component === 'breadcrumb'">
        <section class="additional-component-demo__section" data-docs-case="basic">
          <h3>{{ copy.basic }}</h3>
          <VBreadcrumb :items="copy.breadcrumbItems" :label="copy.breadcrumbLabel" @select="selectBreadcrumb" />
        </section>
        <section class="additional-component-demo__section" data-docs-case="clickable-ancestors">
          <h3>{{ copy.clickable }}</h3>
          <VBreadcrumb :items="breadcrumbItems" :label="copy.breadcrumbLabel" @select="selectBreadcrumb" />
        </section>
        <section class="additional-component-demo__section" data-docs-case="custom-slots">
          <h3>{{ copy.custom }}</h3>
          <VBreadcrumb :items="breadcrumbItems" :label="copy.breadcrumbLabel" @select="selectBreadcrumb">
            <template #item="{ item }">
              <strong>{{ item.label }}</strong>
            </template>
            <template #separator>
              /
            </template>
          </VBreadcrumb>
        </section>
        <section class="additional-component-demo__section" data-docs-case="disabled-ancestor">
          <h3>{{ copy.disabledAncestor }}</h3>
          <VBreadcrumb :items="disabledBreadcrumbItems" :label="copy.breadcrumbLabel" @select="selectBreadcrumb" />
        </section>
        <output v-if="breadcrumbMessage" class="additional-component-demo__value" data-docs-result="breadcrumb" role="status">{{ breadcrumbMessage }}</output>
      </DocsDeviceFrame>
    </div>
  </ComponentPlatformDemo>
</template>

<style scoped>
.additional-component-demo {
  min-width: 0;
  color: var(--varo-foreground);
}

.additional-component-demo__section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid var(--varo-border);
}

.additional-component-demo__section:first-child {
  padding-top: 0;
  border-top: 0;
}

.additional-component-demo__section h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.4;
}

.additional-component-demo__hint,
.additional-component-demo__value {
  margin: 0;
  font-size: 13px;
  color: var(--varo-muted);
  overflow-wrap: anywhere;
}

.additional-component-demo__state {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}

.additional-component-demo__otp {
  max-width: 100%;
  padding: 3px;
  overflow-x: auto;
}

.additional-component-demo__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.additional-component-demo__drawer-content {
  display: grid;
  gap: 16px;
  padding: 56px 24px 24px;
}

.additional-component-demo__drawer-content h2,
.additional-component-demo__drawer-content p {
  margin: 0;
}
</style>
