<script setup lang="ts">
import { ref } from 'vue'
import {
  VButton,
  VDialogClose,
  VDialogContent,
  VDialogOverlay,
  VDialogRoot,
  VDialogTrigger,
  VInput,
  VSwitch
} from '@varo/ui-h5'

const name = ref('Varo')
const loading = ref(false)
const enabled = ref(true)
const clicks = ref(0)

function onPrimaryClick() {
  clicks.value += 1
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 900)
}
</script>

<template>
  <div class="pg">
    <header class="pg__hero">
      <p class="pg__kicker">@varo/playground-h5</p>
      <h1>H5 Playground</h1>
      <p>真实 Vite + Vue 运行时，用于手工验证 `@varo/ui-h5` 交互与主题。</p>
    </header>

    <main class="pg__grid">
      <section class="pg__card">
        <h2>Button / Switch</h2>
        <div class="pg__row">
          <VButton :loading="loading" tone="primary" @click="onPrimaryClick">
            主操作 {{ clicks }}
          </VButton>
          <VButton variant="outline">次要操作</VButton>
          <VButton variant="ghost" :disabled="!enabled">Ghost</VButton>
        </div>
        <label class="pg__switch">
          <span>启用 Ghost 按钮</span>
          <VSwitch v-model="enabled" />
        </label>
      </section>

      <section class="pg__card">
        <h2>Input</h2>
        <VInput v-model:value="name" clearable placeholder="输入名称" />
        <p class="pg__meta">当前值：{{ name || '空' }}</p>
      </section>

      <section class="pg__card">
        <h2>Dialog</h2>
        <VDialogRoot>
          <VDialogTrigger class="pg__trigger" type="button">打开对话框</VDialogTrigger>
          <VDialogOverlay class="pg__overlay" />
          <VDialogContent class="pg__dialog">
            <h3>H5 Dialog</h3>
            <p>这是 playground 中的 composable parts 对话框，用于验证 overlay / close 契约。</p>
            <div class="pg__dialog-actions">
              <VDialogClose class="pg__trigger" type="button">关闭</VDialogClose>
            </div>
          </VDialogContent>
        </VDialogRoot>
      </section>
    </main>
  </div>
</template>

<style scoped>
.pg {
  width: min(960px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0 48px;
}

.pg__hero {
  margin-bottom: 20px;
}

.pg__kicker {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pg__hero h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.04em;
}

.pg__hero p {
  margin: 10px 0 0;
  max-width: 52ch;
  color: #5b677a;
  line-height: 1.6;
}

.pg__grid {
  display: grid;
  gap: 14px;
}

.pg__card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 32px rgba(23, 32, 51, 0.06);
}

.pg__card h2 {
  margin: 0;
  font-size: 16px;
}

.pg__row,
.pg__switch,
.pg__dialog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.pg__switch {
  justify-content: space-between;
  color: #5b677a;
  font-size: 14px;
}

.pg__meta {
  margin: 0;
  color: #5b677a;
  font-size: 13px;
}

.pg__trigger {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
}

.pg__overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.48);
}

.pg__dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(420px, calc(100vw - 32px));
  padding: 18px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
  transform: translate(-50%, -50%);
}

.pg__dialog h3 {
  margin: 0;
}

.pg__dialog p {
  margin: 10px 0 0;
  color: #5b677a;
  line-height: 1.6;
}
</style>
