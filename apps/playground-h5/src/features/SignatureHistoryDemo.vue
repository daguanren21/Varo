<script setup lang="ts">
import type { SignatureStroke } from '../components/ui/signature'
import { computed, shallowRef } from 'vue'
import { VButton } from '../components/ui/button'
import { VSignature } from '../components/ui/signature'

const value = shallowRef<SignatureStroke[]>([])
const disabled = shallowRef(false)
const rejectNext = shallowRef(false)
const delay = shallowRef(false)
const pending = shallowRef<SignatureStroke[] | undefined>()
const notice = shallowRef('画两笔，再尝试撤销、重做和清除。')
const rejectLabel = computed(() => rejectNext.value ? '取消拒绝' : '拒绝下次更新')
const disabledLabel = computed(() => disabled.value ? '启用画布' : '禁用画布')
const delayLabel = computed(() => delay.value ? '关闭延迟接收' : '延迟接收更新')

function update(next: SignatureStroke[]) {
  if (rejectNext.value) {
    rejectNext.value = false
    notice.value = '已拒绝这次更新，画布和历史仍保持已接受的状态。'
    return
  }
  if (delay.value) {
    pending.value = next
    notice.value = '等待接收：画布保持原样；可以继续操作或接收待定更新。'
    return
  }
  value.value = next
  pending.value = undefined
  notice.value = `已接收更新，当前 ${next.length} 笔。`
}

function acceptPending() {
  if (pending.value === undefined) {
    return
  }
  value.value = pending.value
  pending.value = undefined
  notice.value = '已接收待定更新，现在可以撤销或重做。'
}

function echo() {
  value.value = value.value.map(stroke => ({ points: stroke.points.map(point => ({ ...point })) }))
  notice.value = '父级回传了内容相同的副本，撤销与重做历史保留。'
}

function replace() {
  value.value = [{ points: [{ x: 0.15, y: 0.65 }, { x: 0.35, y: 0.25 }, { x: 0.55, y: 0.65 }, { x: 0.85, y: 0.3 }] }]
  pending.value = undefined
  notice.value = '已从父级载入示例。内容改变时历史重置，可继续手写。'
}
</script>

<template>
  <main class="box-border min-h-screen w-full min-w-0 bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <section class="mx-auto grid w-full max-w-xl min-w-0 gap-4" aria-labelledby="signature-history-title">
      <header class="grid gap-2">
        <p class="m-0 text-sm text-[var(--varo-ui-text-regular)]">
          VSignature · 签名历史
        </p>
        <h1 id="signature-history-title" class="m-0 text-2xl font-semibold">
          每一笔，都可以重来
        </h1>
        <p class="m-0 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          在画布中手写两笔，撤销后重做；清除后也能撤销。撤销后画新的一笔会开始新的历史分支。
        </p>
      </header>
      <section class="grid min-w-0 gap-3 rounded-xl bg-[var(--varo-ui-surface)] p-4" aria-label="签名画布">
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
          <strong data-signature-count>已接受 {{ value.length }} 笔</strong>
          <span>{{ disabled ? '已禁用' : '可手写' }}</span>
        </div>
        <VSignature
          :value="value"
          :disabled="disabled"
          :height="200"
          aria-label="手写签名"
          clear-text="清除"
          show-history
          @update:value="update"
        />
        <p class="m-0 text-sm leading-6" role="status" data-signature-notice>
          {{ notice }}
        </p>
      </section>
      <section class="grid min-w-0 gap-3" aria-label="父级接收控制">
        <h2 class="m-0 text-base font-semibold">
          试试父级接收控制
        </h2>
        <div class="flex flex-wrap gap-2">
          <VButton variant="outline" :disabled="disabled" :aria-pressed="rejectNext" @click="rejectNext = !rejectNext">
            {{ rejectLabel }}
          </VButton>
          <VButton variant="outline" :aria-pressed="disabled" @click="disabled = !disabled">
            {{ disabledLabel }}
          </VButton>
          <VButton variant="outline" :aria-pressed="delay" @click="delay = !delay">
            {{ delayLabel }}
          </VButton>
          <VButton variant="outline" :disabled="pending === undefined" @click="acceptPending">
            接收待定更新
          </VButton>
          <VButton variant="outline" @click="echo">
            回传相同副本
          </VButton>
          <VButton variant="outline" @click="replace">
            载入外部示例
          </VButton>
        </div>
        <p v-if="rejectNext" class="m-0 text-sm" role="status">
          下一次绘制、撤销、重做或清除将被拒绝。
        </p>
        <p v-if="delay" class="m-0 text-sm" role="status">
          延迟接收已开启。点击“接收待定更新”后画布才会更新。
        </p>
      </section>
    </section>
  </main>
</template>
