<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput
} from '@varo/ui-h5'

const props = withDefaults(
  defineProps<{
    locale?: 'zh' | 'en'
    surface?: 'home' | 'example'
  }>(),
  {
    locale: 'zh',
    surface: 'home'
  }
)

const variants = ['solid', 'outline', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const

const selectedVariant = ref<(typeof variants)[number]>('solid')
const selectedSize = ref<(typeof sizes)[number]>('md')
const loading = ref(false)
const invalid = ref(false)
const value = ref('Varo input')

const copy = computed(() => {
  if (props.locale === 'en') {
    return {
      title: 'Live Preview',
      description: 'A phone-sized embedded preview rendered with the current H5 wrappers.',
      runtime: 'H5 embedded preview',
      viewport: 'Viewport',
      density: 'Density',
      variant: 'Variant',
      size: 'Size',
      appTitle: 'Mobile Demo',
      appSubtitle: 'Wrapper preview inside docs',
      controlled: 'Controlled input',
      uncontrolled: 'Uncontrolled input',
      current: 'Current value',
      markInvalid: 'Mark invalid',
      clearInvalid: 'Restore valid state',
      primary: 'Submit',
      secondary: 'Secondary',
      dialogHint: 'Composable parts dialog',
      dialogOpen: 'Open dialog',
      dialogClose: 'Close',
      dialogTitle: 'H5 dialog built from primitives.',
      dialogText: 'This preview uses the same Button, Input, and Dialog components exported by @varo/ui-h5.'
    }
  }

  return {
    title: '实时预览',
    description: '基于当前 H5 wrappers 的手机内嵌预览。',
    runtime: 'H5 内嵌预览',
    viewport: '视窗',
    density: '密度',
    variant: '变体',
    size: '尺寸',
    appTitle: '移动端演示',
    appSubtitle: '文档内嵌组件预览',
    controlled: '受控输入',
    uncontrolled: '非受控输入',
    current: '当前值',
    markInvalid: '标记非法',
    clearInvalid: '恢复正常',
    primary: '提交',
    secondary: '次要操作',
    dialogHint: '基于 parts 组合的弹层',
    dialogOpen: '打开弹层',
    dialogClose: '关闭',
    dialogTitle: '基于 primitives 组合出的 H5 对话框。',
    dialogText: '这里使用的 Button、Input 和 Dialog，就是你可以从 @varo/ui-h5 直接引入的组件。'
  }
})
</script>

<template>
  <section :class="['preview-shell', `preview-shell--${surface}`]">
    <header v-if="surface === 'home'" class="preview-head">
      <div>
        <p class="preview-kicker">{{ copy.runtime }}</p>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
    </header>

    <div class="preview-stage">
      <aside class="preview-sidebar">
        <p class="preview-kicker">{{ copy.runtime }}</p>
        <h3>{{ copy.appTitle }}</h3>
        <p>{{ copy.description }}</p>

        <div class="preview-meta-grid">
          <div class="preview-meta-card">
            <span>{{ copy.viewport }}</span>
            <strong>390 x 844</strong>
          </div>
          <div class="preview-meta-card">
            <span>{{ copy.density }}</span>
            <strong>DPR 2</strong>
          </div>
        </div>

        <div class="preview-control-block">
          <span>{{ copy.variant }}</span>
          <div class="preview-segment">
            <button
              v-for="variant in variants"
              :key="variant"
              class="preview-segment-btn"
              :data-active="selectedVariant === variant"
              type="button"
              @click="selectedVariant = variant"
            >
              {{ variant }}
            </button>
          </div>
        </div>

        <div class="preview-control-block">
          <span>{{ copy.size }}</span>
          <div class="preview-segment">
            <button
              v-for="size in sizes"
              :key="size"
              class="preview-segment-btn"
              :data-active="selectedSize === size"
              type="button"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </aside>

      <div class="phone-frame" aria-label="mobile preview frame">
        <div class="phone-bezel">
          <div class="phone-notch" />
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span>5G · DPR 2</span>
            </div>

            <div class="phone-appbar">
              <h4>{{ copy.appTitle }}</h4>
              <p>{{ copy.appSubtitle }}</p>
            </div>

            <div class="phone-content">
              <section class="phone-card">
                <label class="phone-field">
                  <span>{{ copy.controlled }}</span>
                  <VInput v-model:value="value" clearable :invalid="invalid" :max-length="24" show-word-limit />
                </label>

                <button class="phone-inline-action" type="button" @click="invalid = !invalid">
                  {{ invalid ? copy.clearInvalid : copy.markInvalid }}
                </button>

                <span class="phone-caption">{{ copy.current }}: {{ value }}</span>
              </section>

              <section class="phone-card">
                <label class="phone-field">
                  <span>{{ copy.uncontrolled }}</span>
                  <VInput default-value="Design primitives, theme, docs" />
                </label>

                <div class="phone-actions">
                  <VButton
                    :variant="selectedVariant"
                    :size="selectedSize"
                    :loading="loading"
                    @click="loading = !loading"
                  >
                    {{ copy.primary }}
                  </VButton>
                  <VButton variant="ghost" size="sm">{{ copy.secondary }}</VButton>
                </div>
              </section>

              <section class="phone-card phone-card--dialog">
                <div class="phone-dialog-zone">
                  <div class="phone-card-head">
                    <span>Dialog</span>
                    <small>{{ copy.dialogHint }}</small>
                  </div>

                  <VDialogRoot>
                    <VDialogTrigger class="phone-trigger" type="button">{{ copy.dialogOpen }}</VDialogTrigger>
                    <VDialogOverlay class="phone-overlay" />
                    <VDialogContent class="phone-dialog">
                      <h5>{{ copy.dialogTitle }}</h5>
                      <p>{{ copy.dialogText }}</p>
                      <div class="phone-dialog-actions">
                        <VDialogClose class="phone-dialog-close" type="button">{{ copy.dialogClose }}</VDialogClose>
                      </div>
                    </VDialogContent>
                  </VDialogRoot>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.preview-shell {
  margin: 28px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.9)),
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 32%);
}

.preview-shell--example {
  margin-top: 18px;
}

.preview-head h2,
.preview-sidebar h3 {
  margin: 0;
  letter-spacing: -0.03em;
}

.preview-head p,
.preview-sidebar p {
  margin: 8px 0 0;
}

.preview-kicker {
  margin: 0 0 10px;
  color: var(--vp-c-brand-1);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.preview-stage {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 430px);
  gap: 22px;
  align-items: start;
}

.preview-head + .preview-stage {
  margin-top: 22px;
}

.preview-sidebar {
  display: grid;
  gap: 16px;
}

.preview-meta-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preview-meta-card,
.preview-control-block {
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.64);
}

.preview-meta-card span,
.preview-control-block span {
  display: block;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.preview-meta-card strong {
  display: block;
  margin-top: 8px;
  font-size: 1rem;
}

.preview-segment {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.preview-segment-btn {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  cursor: pointer;
}

.preview-segment-btn[data-active='true'] {
  border-color: transparent;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
}

.phone-frame {
  display: flex;
  justify-content: center;
}

.phone-bezel {
  position: relative;
  width: 410px;
  padding: 12px;
  border-radius: 40px;
  background: linear-gradient(180deg, #18212f, #0b1220);
  box-shadow:
    0 28px 90px rgba(15, 23, 42, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.phone-notch {
  position: absolute;
  top: 14px;
  left: 50%;
  width: 132px;
  height: 24px;
  border-radius: 0 0 16px 16px;
  transform: translateX(-50%);
  background: #0b1220;
  z-index: 3;
}

.phone-screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 390 / 844;
  border-radius: 30px;
  background:
    linear-gradient(180deg, #f7fbff 0%, #edf7f4 100%),
    radial-gradient(circle at top, rgba(15, 118, 110, 0.12), transparent 26%);
}

.phone-status-bar,
.phone-appbar,
.phone-content {
  position: relative;
  z-index: 1;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  padding: 18px 20px 8px;
  color: var(--vp-c-text-2);
  font-size: 0.74rem;
}

.phone-appbar {
  padding: 10px 20px 0;
}

.phone-appbar h4 {
  margin: 0;
  font-size: 1.18rem;
  letter-spacing: -0.03em;
}

.phone-appbar p {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
}

.phone-content {
  display: grid;
  gap: 14px;
  padding: 18px 18px 20px;
}

.phone-card {
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.14);
}

.phone-field {
  display: grid;
  gap: 8px;
}

.phone-field span,
.phone-card-head span,
.phone-card-head small,
.phone-caption,
.phone-inline-action {
  font-size: 0.82rem;
}

.phone-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 12px;
}

.phone-card-head small,
.phone-caption {
  color: var(--vp-c-text-2);
}

.phone-inline-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  margin-top: 12px;
  padding: 0 12px;
  border: 1px solid rgba(15, 118, 110, 0.18);
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: var(--vp-c-brand-1);
  cursor: pointer;
}

.phone-caption {
  display: block;
  margin-top: 10px;
}

.phone-actions {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.phone-dialog-zone {
  position: relative;
  min-height: 180px;
}

.phone-trigger,
.phone-dialog-close,
:deep(.varo-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  width: 100%;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
}

:deep(.varo-button[data-size='sm']) {
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 0.82rem;
}

:deep(.varo-button[data-size='md']) {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 16px;
  font-size: 0.92rem;
}

:deep(.varo-button[data-size='lg']) {
  gap: 10px;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 18px;
  font-size: 1rem;
}

.phone-trigger,
.phone-dialog-close,
:deep(.varo-button[data-variant='solid']) {
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: white;
}

:deep(.varo-button[data-variant='outline']) {
  background: transparent;
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

:deep(.varo-button[data-variant='ghost']) {
  background: rgba(15, 118, 110, 0.1);
  color: var(--vp-c-brand-1);
}

:deep(.varo-button[data-shape='round']) {
  border-radius: 999px;
}

:deep(.varo-button[data-hairline='true']) {
  border-width: 0.5px;
}

:deep(.varo-button__icon) {
  flex: none;
}

:deep(.varo-button__loading-icon) {
  flex: none;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: phone-preview-spin 0.75s linear infinite;
}

@keyframes phone-preview-spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.varo-input) {
  display: grid;
  gap: 6px;
  width: 100%;
  color: var(--vp-c-text-1);
}

:deep(.varo-input__body) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}

:deep(.varo-input__control) {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

:deep(textarea.varo-input__control) {
  padding: 10px 0;
  resize: none;
}

:deep(.varo-input__prefix),
:deep(.varo-input__suffix),
:deep(.varo-input__clear),
:deep(.varo-input__word-limit) {
  flex: none;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

:deep(.varo-input__clear) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.14);
  cursor: pointer;
}

:deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: rgba(185, 28, 28, 0.52);
}

.phone-overlay {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(4px);
}

.phone-dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.22);
}

.phone-dialog h5 {
  margin: 0;
  font-size: 0.95rem;
}

.phone-dialog p {
  margin: 10px 0 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.phone-dialog-actions {
  margin-top: 14px;
}

@media (max-width: 960px) {
  .preview-stage {
    grid-template-columns: 1fr;
  }

  .phone-bezel {
    width: min(100%, 410px);
  }
}

.preview-shell {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card);
  box-shadow: var(--varo-shadow-sm);
}

.preview-kicker {
  color: var(--varo-muted);
  letter-spacing: 0;
  text-transform: none;
}

.preview-head h2,
.preview-sidebar h3,
.phone-appbar h4 {
  letter-spacing: 0;
}

.preview-meta-card,
.preview-control-block,
.phone-card {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius-lg);
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-sm);
}

.preview-segment-btn,
.phone-inline-action {
  border-color: var(--varo-border);
  border-radius: var(--varo-radius);
  background: var(--varo-card-solid);
  color: var(--varo-foreground);
}

.preview-segment-btn[data-active='true'],
.phone-trigger,
.phone-dialog-close,
:deep(.varo-button[data-variant='solid']) {
  border-color: var(--varo-primary);
  background: var(--varo-primary);
  color: var(--varo-primary-foreground);
}

.phone-bezel {
  border-radius: 30px;
  background: #18181b;
  box-shadow: 0 18px 44px rgba(24, 24, 27, 0.18);
}

.phone-notch {
  border-radius: 0 0 10px 10px;
  background: #18181b;
}

.phone-screen {
  border-radius: 22px;
  background: var(--varo-bg);
}

.phone-trigger,
.phone-dialog-close,
:deep(.varo-button),
:deep(.varo-button[data-size='sm']),
:deep(.varo-button[data-size='md']),
:deep(.varo-button[data-size='lg']),
:deep(.varo-input__body),
:deep(.varo-input__clear),
.phone-overlay,
.phone-dialog {
  border-radius: var(--varo-radius);
}

:deep(.varo-button[data-variant='ghost']) {
  background: var(--varo-card-muted);
  color: var(--varo-foreground);
}

:deep(.varo-input__body) {
  border-color: var(--varo-border);
  background: var(--varo-card);
}

.phone-overlay {
  background: rgba(24, 24, 27, 0.58);
}

.phone-dialog {
  border-color: var(--varo-border);
  background: var(--varo-card-solid);
  box-shadow: var(--varo-shadow-popover);
}

</style>
