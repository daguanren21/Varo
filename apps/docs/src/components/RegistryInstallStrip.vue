<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

type Locale = 'en' | 'zh'
type RegistryTarget = 'h5' | 'weapp'
type CopyState = 'copied' | 'idle' | 'unsupported'

const props = withDefaults(
  defineProps<{
    item: `components/${string}`
    locale?: Locale
    targets: RegistryTarget[]
    wrapperTargets?: RegistryTarget[]
  }>(),
  {
    locale: 'zh',
    wrapperTargets: undefined,
  },
)

const copiedCommand = shallowRef('')
const copyState = shallowRef<CopyState>('idle')
let copyTimer: number | undefined

const copy = computed(() => props.locale === 'zh'
  ? {
      copied: '已复制',
      copy: '复制命令',
      copyManual: '请手动复制命令',
      description: '在项目根目录执行。CLI 会把目标端源码和 Registry 依赖写入项目。',
      h5: 'H5',
      title: 'Registry 优先安装',
      weapp: '小程序',
      weappSetup: '小程序 Registry 首次接入还需要一次性配置 Wevu 7 全局样式和 Tailwind。',
      weappSetupLink: '查看接入步骤',
      wrapper: '封装包导入（次选）',
      wrapperDescription: '需要预构建封装时，再从对应运行时包导入。',
    }
  : {
      copied: 'Copied',
      copy: 'Copy command',
      copyManual: 'Copy the command manually',
      description: 'Run at the project root. The CLI writes target-specific source and Registry dependencies into your project.',
      h5: 'H5',
      title: 'Registry-first install',
      weapp: 'Mini Program',
      weappSetup: 'A first-time Mini Program Registry setup must configure the Wevu 7 global styles and Tailwind.',
      weappSetupLink: 'Open the setup guide',
      wrapper: 'Wrapper-package imports (secondary)',
      wrapperDescription: 'Use the matching runtime package only when you prefer a prebuilt wrapper.',
    })

const installCommands = computed(() => props.targets.map(target => ({
  command: `pnpm dlx @varo-ui/cli add --target ${target} ${props.item}`,
  label: target === 'h5' ? copy.value.h5 : copy.value.weapp,
  target,
})))

const hasWeappTarget = computed(() => props.targets.includes('weapp'))
const weappSetupHref = computed(() => withBase(
  props.locale === 'zh' ? '/guide/shadcn-mode' : '/en/guide/shadcn-mode',
))

const secondaryPackages = computed(() => {
  const targets = props.wrapperTargets ?? props.targets
  return targets.map(target => target === 'h5' ? '@varo-ui/h5' : '@varo-ui/weapp')
})

function copyButtonLabel(command: string) {
  if (copiedCommand.value !== command) {
    return copy.value.copy
  }
  return copyState.value === 'copied' ? copy.value.copied : copy.value.copyManual
}

async function copyCommand(command: string) {
  copiedCommand.value = command
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    copyState.value = 'unsupported'
    return
  }

  try {
    await navigator.clipboard.writeText(command)
    copyState.value = 'copied'
  }
  catch {
    copyState.value = 'unsupported'
  }

  if (copyTimer !== undefined) {
    window.clearTimeout(copyTimer)
  }
  copyTimer = window.setTimeout(() => {
    copiedCommand.value = ''
    copyState.value = 'idle'
    copyTimer = undefined
  }, 1400)
}

onBeforeUnmount(() => {
  if (copyTimer !== undefined) {
    window.clearTimeout(copyTimer)
  }
})
</script>

<template>
  <aside class="custom-block tip registry-install-strip" :aria-label="copy.title">
    <p class="custom-block-title">
      {{ copy.title }}
    </p>
    <p>{{ copy.description }}</p>
    <ul>
      <li v-for="install in installCommands" :key="install.target">
        <strong>{{ install.label }}</strong>
        <code>{{ install.command }}</code>
        <button
          type="button"
          :aria-label="`${copyButtonLabel(install.command)}: ${install.label}`"
          @click="copyCommand(install.command)"
        >
          {{ copyButtonLabel(install.command) }}
        </button>
      </li>
    </ul>
    <p v-if="hasWeappTarget">
      {{ copy.weappSetup }}
      <a :href="weappSetupHref">{{ copy.weappSetupLink }}</a>
    </p>
    <p v-if="secondaryPackages.length">
      <strong>{{ copy.wrapper }}:</strong>
      {{ copy.wrapperDescription }}
      <code v-for="packageName in secondaryPackages" :key="packageName">{{ packageName }}</code>
    </p>
    <output v-if="copyState === 'unsupported'" aria-live="polite">
      {{ copy.copyManual }}
    </output>
  </aside>
</template>

<style scoped>
.registry-install-strip button {
  min-height: 44px;
  padding: 0 10px;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--varo-primary-text);
  cursor: pointer;
  background: var(--varo-primary-soft);
  border: 1px solid color-mix(in srgb, var(--varo-primary) 36%, var(--varo-border));
  border-radius: var(--varo-radius);
}

.registry-install-strip button:focus-visible {
  outline: 2px solid var(--varo-ui-focus, var(--varo-foreground));
  outline-offset: 2px;
}
</style>
