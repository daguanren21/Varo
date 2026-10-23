<script setup lang="ts">
import { VAvatar, VAvatarGroup, VButton, VIcon } from '@varo-ui/h5'
import { withBase } from 'vitepress'
import { computed, shallowRef } from 'vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'

const props = withDefaults(defineProps<{ locale?: 'zh' | 'en' }>(), { locale: 'zh' })
const includeLast = shallowRef(true)
const brandImage = withBase('/brand-assets/varo-app-icon.png')
const unavailableImage = 'data:image/png;base64,AA=='
const members = [
  { id: 'ada', alt: 'Ada', fallback: 'A' },
  { id: 'bo', alt: 'Bo', fallback: 'B' },
  { id: 'chen', alt: 'Chen', fallback: 'C' },
  { id: 'dee', alt: 'Dee', fallback: 'D' },
  { id: 'eli', alt: 'Eli', fallback: 'E' },
]
const copy = computed(() => props.locale === 'en'
  ? {
      fallback: 'Fallback content',
      image: 'Image',
      initials: 'Initials',
      unavailable: 'Unavailable image',
      maintainer: 'Varo Maintainer',
      shapes: 'Shapes',
      circle: 'Circle',
      rounded: 'Rounded',
      square: 'Square',
      sizes: 'Sizes and custom fallback',
      group: 'Avatar group',
      groupLabel: 'Project members',
      remove: 'Hide final member',
      restore: 'Restore final member',
      groupHint: 'Three visible avatars; the counter shows the remaining members.',
      members: 'Members',
    }
  : {
      fallback: '回退内容',
      image: '图片头像',
      initials: '文字头像',
      unavailable: '图片不可用',
      maintainer: 'Varo 维护者',
      shapes: '形状',
      circle: '圆形',
      rounded: '圆角',
      square: '方形',
      sizes: '尺寸与自定义回退',
      group: '头像组',
      groupLabel: '项目成员',
      remove: '隐藏最后一位',
      restore: '恢复最后一位',
      groupHint: '展示三个头像，计数圆点显示其余人数。',
      members: '成员数',
    })
</script>

<template>
  <DocsDeviceFrame>
    <div class="avatar-demo" data-docs-component="avatar">
      <section class="avatar-demo__section" data-docs-case="image-fallback">
        <h3>{{ copy.fallback }}</h3>
        <div class="avatar-demo__row">
          <div class="avatar-demo__sample">
            <VAvatar :src="brandImage" alt="Varo" :size="48" />
            <span>{{ copy.image }}</span>
          </div>
          <div class="avatar-demo__sample">
            <VAvatar :alt="copy.maintainer" fallback="VA" :size="48" />
            <span>{{ copy.initials }}</span>
          </div>
          <div class="avatar-demo__sample">
            <VAvatar :src="unavailableImage" :alt="copy.maintainer" fallback="VA" :size="48" />
            <span>{{ copy.unavailable }}</span>
          </div>
        </div>
      </section>
      <section class="avatar-demo__section" data-docs-case="shapes">
        <h3>{{ copy.shapes }}</h3>
        <div class="avatar-demo__row">
          <div class="avatar-demo__sample">
            <VAvatar :src="brandImage" alt="Varo" shape="circle" :size="48" />
            <span>{{ copy.circle }}</span>
          </div>
          <div class="avatar-demo__sample">
            <VAvatar :src="brandImage" alt="Varo" shape="rounded" :size="48" />
            <span>{{ copy.rounded }}</span>
          </div>
          <div class="avatar-demo__sample">
            <VAvatar :src="brandImage" alt="Varo" shape="square" :size="48" />
            <span>{{ copy.square }}</span>
          </div>
        </div>
      </section>
      <section class="avatar-demo__section" data-docs-case="sizes">
        <h3>{{ copy.sizes }}</h3>
        <div class="avatar-demo__row avatar-demo__row--sizes">
          <VAvatar :alt="copy.maintainer" fallback="VA" :size="32" />
          <VAvatar :alt="copy.maintainer" fallback="VA" :size="40" />
          <VAvatar :alt="copy.maintainer" :size="64">
            <template #fallback>
              <VIcon name="check" :size="28" tone="primary" />
            </template>
          </VAvatar>
        </div>
      </section>
      <section class="avatar-demo__section" data-docs-case="avatar-group">
        <h3>{{ copy.group }}</h3>
        <p>{{ copy.groupHint }}</p>
        <VAvatarGroup :max="3" :aria-label="copy.groupLabel">
          <template v-for="(member, index) in members" :key="member.id">
            <VAvatar v-if="index < 4 || includeLast" :alt="member.alt" :fallback="member.fallback" />
          </template>
        </VAvatarGroup>
        <div class="avatar-demo__row">
          <VButton size="sm" variant="outline" @click="includeLast = !includeLast">
            {{ includeLast ? copy.remove : copy.restore }}
          </VButton>
          <output data-docs-state="avatar-members" aria-live="polite">{{ copy.members }}: {{ includeLast ? 5 : 4 }}</output>
        </div>
      </section>
    </div>
  </DocsDeviceFrame>
</template>

<style scoped>
.avatar-demo {
  min-width: 0;
  color: var(--varo-foreground);
}

.avatar-demo__section {
  display: grid;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid var(--varo-border);
}

.avatar-demo__section:first-child {
  padding-top: 0;
  border-top: 0;
}

.avatar-demo__section h3 {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.4;
}

.avatar-demo__section p,
.avatar-demo__section output,
.avatar-demo__sample span {
  margin: 0;
  font-size: 12px;
  color: var(--varo-muted);
}

.avatar-demo__row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.avatar-demo__row--sizes {
  align-items: flex-end;
}

.avatar-demo__sample {
  display: grid;
  gap: 8px;
  justify-items: center;
}
</style>
