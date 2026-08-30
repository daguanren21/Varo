<script setup lang="ts">
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput,
} from '@varo-ui/h5'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    locale?: 'zh' | 'en'
    surface?: 'home' | 'example'
  }>(),
  {
    locale: 'zh',
    surface: 'home',
  },
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
      dialogText: 'This preview uses the same Button, Input, and Dialog components exported by @varo-ui/h5.',
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
    dialogText: '这里使用的 Button、Input 和 Dialog，就是你可以从 @varo-ui/h5 直接引入的组件。',
  }
})
</script>

<template>
  <section class="preview-shell" :class="[`preview-shell--${surface}`]">
    <header v-if="surface === 'home'" class="preview-head">
      <div>
        <p class="preview-kicker">
          {{ copy.runtime }}
        </p>
        <h2>{{ copy.title }}</h2>
        <p>{{ copy.description }}</p>
      </div>
    </header>

    <div class="preview-stage">
      <aside class="preview-sidebar">
        <p class="preview-kicker">
          {{ copy.runtime }}
        </p>
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
                  <VButton variant="ghost" size="sm">
                    {{ copy.secondary }}
                  </VButton>
                </div>
              </section>

              <section class="phone-card phone-card--dialog">
                <div class="phone-dialog-zone">
                  <div class="phone-card-head">
                    <span>Dialog</span>
                    <small>{{ copy.dialogHint }}</small>
                  </div>

                  <VDialogRoot>
                    <VDialogTrigger class="phone-trigger" type="button">
                      {{ copy.dialogOpen }}
                    </VDialogTrigger>
                    <VDialogOverlay class="phone-overlay" />
                    <VDialogContent class="phone-dialog">
                      <h5>{{ copy.dialogTitle }}</h5>
                      <p>{{ copy.dialogText }}</p>
                      <div class="phone-dialog-actions">
                        <VDialogClose class="phone-dialog-close" type="button">
                          {{ copy.dialogClose }}
                        </VDialogClose>
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
  --preview-surface: var(--varo-demo-surface);
  --preview-surface-strong: var(--varo-demo-surface-strong);
  --preview-border: var(--varo-demo-border);
  --preview-text-muted: var(--varo-demo-text-muted);
  --preview-brand: var(--varo-demo-brand);
  --preview-shadow: var(--varo-demo-shadow);
  --preview-phone-shell: var(--varo-demo-phone-shell);
  --preview-phone-screen: var(--varo-demo-phone-screen);
  --preview-phone-card: var(--varo-demo-phone-card);

  padding: 16px;
  margin: 24px 0;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--preview-surface) 94%, transparent), var(--preview-surface-strong)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent), transparent 34%);
  border: 1px solid var(--preview-border);
  border-radius: var(--varo-demo-radius-lg);
  box-shadow: var(--preview-shadow);
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
  max-width: 42ch;
  margin: 8px 0 0;
  line-height: 1.55;
  color: var(--preview-text-muted);
}

.preview-kicker {
  margin: 0 0 10px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--preview-brand);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.preview-stage {
  display: grid;
  grid-template-columns: minmax(0, 248px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.preview-head + .preview-stage {
  margin-top: 18px;
}

.preview-sidebar {
  display: grid;
  gap: 14px;
  align-content: start;
}

.preview-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.preview-meta-card,
.preview-control-block {
  padding: 12px 14px;
  background: color-mix(in srgb, var(--preview-surface-strong) 92%, transparent);
  border: 1px solid var(--preview-border);
  border-radius: 16px;
}

.preview-meta-card span,
.preview-control-block span {
  display: block;
  font-size: 0.78rem;
  color: var(--preview-text-muted);
}

.preview-meta-card strong {
  display: block;
  margin-top: 6px;
  font-size: 0.92rem;
}

.preview-segment {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.preview-segment-btn {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--preview-border);
  border-radius: 999px;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.preview-segment-btn[data-active='true'] {
  color: var(--varo-primary-foreground);
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  border-color: transparent;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--vp-c-brand-1) 28%, transparent);
}

.preview-segment-btn:hover:not([data-active='true']) {
  color: var(--preview-brand);
  background: color-mix(in srgb, var(--preview-brand) 8%, transparent);
  border-color: color-mix(in srgb, var(--preview-brand) 42%, var(--preview-border));
}

.preview-segment-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--preview-brand) 70%, transparent);
  outline-offset: 2px;
}

.phone-frame {
  display: flex;
  justify-content: center;
}

.phone-bezel {
  position: relative;
  width: min(100%, 390px);
  padding: 12px;
  background: var(--preview-phone-shell);
  border-radius: 40px;
  box-shadow:
    0 28px 80px color-mix(in srgb, var(--varo-foreground) 28%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--varo-card-solid) 14%, transparent);
}

.phone-notch {
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: 3;
  width: 118px;
  height: 22px;
  background: color-mix(in srgb, var(--varo-foreground) 98%, var(--varo-bg));
  border-radius: 0 0 14px 14px;
  transform: translateX(-50%);
}

.phone-screen {
  position: relative;
  min-height: 560px;
  aspect-ratio: 390 / 844;
  overflow: hidden;
  color: var(--vp-c-text-1);
  background:
    var(--preview-phone-screen),
    radial-gradient(circle at top, color-mix(in srgb, var(--varo-primary) 10%, transparent), transparent 28%);
  border-radius: 30px;
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
  font-size: 0.74rem;
  color: var(--vp-c-text-2);
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
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.phone-content {
  display: grid;
  gap: 12px;
  padding: 14px 14px 18px;
}

.phone-card {
  padding: 14px;
  background: var(--preview-phone-card);
  border: 1px solid var(--preview-border);
  border-radius: 18px;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
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
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.phone-card-head small,
.phone-caption {
  color: var(--preview-text-muted);
}

.phone-inline-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  margin-top: 12px;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  background: var(--varo-accent-soft);
  border: 1px solid var(--varo-ring);
  border-radius: 999px;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.phone-inline-action:hover {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 14%, var(--varo-accent-soft));
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 48%, var(--varo-ring));
  box-shadow: 0 6px 14px color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent);
}

.phone-inline-action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--vp-c-brand-1) 70%, transparent);
  outline-offset: 2px;
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
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 16px;
}

:deep(.varo-button[data-size='sm']) {
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  font-size: 0.82rem;
  border-radius: 12px;
}

:deep(.varo-button[data-size='md']) {
  min-height: 42px;
  padding: 0 16px;
  font-size: 0.92rem;
  border-radius: 16px;
}

:deep(.varo-button[data-size='lg']) {
  gap: 10px;
  min-height: 50px;
  padding: 0 20px;
  font-size: 1rem;
  border-radius: 18px;
}

.phone-trigger,
.phone-dialog-close,
:deep(.varo-button[data-variant='solid']) {
  color: var(--varo-primary-foreground);
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
}

:deep(.varo-button[data-variant='outline']) {
  color: var(--vp-c-text-1);
  background: transparent;
  border-color: var(--vp-c-divider);
}

:deep(.varo-button[data-variant='ghost']) {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--varo-primary) 10%, transparent);
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
  border: 2px solid currentcolor;
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
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  background: color-mix(in srgb, var(--varo-card-solid) 80%, transparent);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
}

:deep(.varo-input__control) {
  flex: 1;
  min-width: 0;
  font: inherit;
  color: inherit;
  outline: 0;
  background: transparent;
  border: 0;
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
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

:deep(.varo-input__clear) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-muted) 14%, transparent);
  border: 0;
  border-radius: 999px;
}

:deep(.varo-input[data-invalid='true'] .varo-input__body) {
  border-color: color-mix(in srgb, var(--varo-danger) 52%, transparent);
}

.phone-overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--varo-foreground) 36%, transparent);
  border-radius: 18px;
  backdrop-filter: blur(4px);
}

.phone-dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  padding: 16px;
  background: color-mix(in srgb, var(--varo-card-solid) 95%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: 20px;
  box-shadow: var(--varo-shadow-popover);
}

.phone-dialog h5 {
  margin: 0;
  font-size: 0.95rem;
}

.phone-dialog p {
  margin: 10px 0 0;
  font-size: 0.82rem;
  color: var(--preview-text-muted);
}

.phone-dialog-actions {
  margin-top: 14px;
}

@media (max-width: 960px) {
  .preview-stage {
    grid-template-columns: 1fr;
  }

  .phone-bezel {
    width: min(100%, 390px);
  }
}

.preview-shell {
  border-color: var(--preview-border);
  border-radius: 28px;
}

.preview-kicker {
  color: var(--preview-brand);
}

.preview-meta-card,
.preview-control-block {
  background: color-mix(in srgb, var(--preview-surface-strong) 92%, transparent);
  border-color: var(--preview-border);
  border-radius: 16px;
}

.phone-card {
  background: var(--preview-phone-card);
  border-color: var(--preview-border);
  border-radius: 18px;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.preview-segment-btn,
.phone-inline-action {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--preview-surface-strong) 92%, transparent);
  border-color: var(--preview-border);
  border-radius: 999px;
}

.preview-segment-btn[data-active='true'],
.phone-trigger,
.phone-dialog-close,
:deep(.varo-button[data-variant='solid']) {
  color: var(--varo-primary-foreground);
  background: var(--varo-primary);
  border-color: var(--varo-primary);
}

.phone-bezel {
  border-radius: 40px;
}

.phone-notch {
  border-radius: 0 0 14px 14px;
}

.phone-screen {
  border-radius: 30px;
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
  color: var(--varo-foreground);
  background: var(--varo-card-muted);
}

:deep(.varo-input__body) {
  background: var(--varo-card);
  border-color: var(--varo-border);
}

.phone-overlay {
  background: color-mix(in srgb, var(--varo-foreground) 58%, transparent);
}

.phone-dialog {
  background: var(--varo-card-solid);
  border-color: var(--varo-border);
  box-shadow: var(--varo-shadow-popover);
}
</style>
