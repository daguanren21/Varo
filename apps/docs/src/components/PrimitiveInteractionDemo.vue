<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  ButtonRoot,
  CheckboxIndicator,
  CheckboxRoot,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogRoot,
  DialogTrigger,
  InputRoot,
  OverlayRoot,
  PopupRoot,
  PopoverClose,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  StickyRoot,
  SwitchRoot,
  SwitchThumb,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger
} from '@varo/primitives-h5'
import type { SelectOption, SelectPrimitiveValue } from '@varo/primitives-h5'

type Locale = 'zh' | 'en'

const props = withDefaults(
  defineProps<{
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const dialogOpen = shallowRef(false)
const overlayVisible = shallowRef(false)
const popupVisible = shallowRef(false)
const inputValue = shallowRef('Varo primitives')
const buttonClicks = shallowRef(0)
const accordionValue = shallowRef<string | string[] | undefined>('foundation')
const checkboxChecked = shallowRef(false)
const collapsibleOpen = shallowRef(false)
const popoverOpen = shallowRef(false)
const radioValue = shallowRef('h5')
const selectValue = shallowRef<SelectPrimitiveValue>(undefined)
const switchChecked = shallowRef(false)
const tabsValue = shallowRef('foundation')
const selectOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' },
  { disabled: true, label: 'Business Wrapper', value: 'business-wrapper' }
] satisfies SelectOption[]

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        title: 'Primitives 交互展示',
        caption: '这些组件只处理状态、事件和语义属性。业务组件可以在它们上面添加 token、样式和领域 API。',
        button: 'ButtonRoot',
        buttonAction: '点击',
        clicked: '已触发',
        input: 'InputRoot',
        inputHint: '输入会通过 primitive 的 valueChange 契约向外同步。',
        checkbox: 'CheckboxRoot / CheckboxIndicator',
        checkboxLabel: '启用跨端状态',
        checkboxBody: 'CheckboxRoot 输出 checked、data-state 与 disabled 契约，CheckboxIndicator 只跟随状态渲染。',
        collapsible: 'CollapsibleRoot / CollapsibleTrigger / CollapsibleContent',
        collapsibleAction: '展开高级设置',
        collapsiblePanel: '业务 wrapper 可以在这里放筛选项、详情或高级表单字段。',
        collapsibleBody: 'Collapsible 只管理单个 disclosure 的 open、disabled 和 data-state。',
        accordion: 'AccordionRoot / AccordionItem / AccordionTrigger / AccordionContent',
        accordionFoundation: '基座职责',
        accordionFoundationBody: '稳定状态、事件、ARIA 和 data-state。',
        accordionWrapper: 'Wrapper 职责',
        accordionWrapperBody: '视觉 token、动画、图标和业务布局。',
        accordionBody: 'Accordion 支持 single、multiple、collapsible 和 item disabled。',
        dialog: 'DialogRoot',
        dialogAction: '打开 DialogRoot',
        dialogBody: 'DialogTrigger、DialogOverlay、DialogContent、DialogClose 共享同一个 Root 状态。',
        close: '关闭',
        overlay: 'OverlayRoot',
        overlayAction: '显示 OverlayRoot',
        overlayBody: '点击遮罩会触发 closeOnClickOverlay 的关闭契约。',
        popup: 'PopupRoot',
        popupAction: '打开 PopupRoot',
        popupBody: 'PopupRoot 负责 overlay、content、position、closeable 与滚动锁定。',
        popover: 'PopoverRoot / PopoverTrigger / PopoverContent / PopoverClose',
        popoverAction: '打开轻量操作面板',
        popoverPanel: 'primitive 管行为契约，UI wrapper 管视觉与定位。',
        popoverBody: 'H5 支持 Escape 和外部点击关闭；weapp wrapper 使用显式 Close 或页面级 dismiss adapter。',
        radio: 'RadioGroup / RadioItem / RadioIndicator',
        radioH5: 'H5',
        radioWeapp: '小程序',
        radioBody: 'RadioGroup 统一 value，RadioItem 与 RadioIndicator 只消费选中态。',
        select: 'SelectRoot',
        selectPlaceholder: '选择基座层级',
        selectGroup: 'Reka-style anatomy',
        selectBody: 'SelectRoot / SelectTrigger / SelectValue / SelectContent / SelectItem 共享 value、open、data-state 与 data-placeholder 契约。',
        switch: 'SwitchRoot / SwitchThumb',
        switchBody: 'SwitchRoot 管理 checked、loading、disabled，SwitchThumb 只负责 thumb part 属性。',
        tabs: 'TabsRoot / TabsList / TabsTrigger / TabsContent',
        tabsFoundation: '基座',
        tabsBlocks: 'Blocks',
        tabsFoundationBody: '基座 primitives 提供可复用的交互状态。',
        tabsBlocksBody: 'Blocks 在同一契约上叠加业务布局和数据。',
        tabsBody: 'TabsRoot 持有当前 value，Trigger 与 Content 通过 data-state 对齐。',
        sticky: 'StickyRoot',
        stickyBody: 'StickyRoot 输出 fixed 状态，外层 wrapper 决定最终视觉。'
      }
    : {
        title: 'Primitives Interaction Demo',
        caption: 'These components handle state, events, and semantic attributes only. Product wrappers add tokens, styles, and domain APIs on top.',
        button: 'ButtonRoot',
        buttonAction: 'Click',
        clicked: 'events',
        input: 'InputRoot',
        inputHint: 'Typing syncs through the primitive valueChange contract.',
        checkbox: 'CheckboxRoot / CheckboxIndicator',
        checkboxLabel: 'Enable cross-runtime state',
        checkboxBody: 'CheckboxRoot exposes checked, data-state, and disabled contracts; CheckboxIndicator renders from state only.',
        collapsible: 'CollapsibleRoot / CollapsibleTrigger / CollapsibleContent',
        collapsibleAction: 'Show advanced settings',
        collapsiblePanel: 'Business wrappers can place filters, details, or advanced form fields here.',
        collapsibleBody: 'Collapsible owns open, disabled, and data-state for one disclosure.',
        accordion: 'AccordionRoot / AccordionItem / AccordionTrigger / AccordionContent',
        accordionFoundation: 'Foundation responsibility',
        accordionFoundationBody: 'Stable state, events, ARIA, and data-state.',
        accordionWrapper: 'Wrapper responsibility',
        accordionWrapperBody: 'Visual tokens, motion, icons, and product layout.',
        accordionBody: 'Accordion supports single, multiple, collapsible, and item-disabled contracts.',
        dialog: 'DialogRoot',
        dialogAction: 'Open DialogRoot',
        dialogBody: 'DialogTrigger, DialogOverlay, DialogContent, and DialogClose share one Root state.',
        close: 'Close',
        overlay: 'OverlayRoot',
        overlayAction: 'Show OverlayRoot',
        overlayBody: 'Clicking the layer follows the closeOnClickOverlay contract.',
        popup: 'PopupRoot',
        popupAction: 'Open PopupRoot',
        popupBody: 'PopupRoot owns overlay, content, position, closeable, and scroll-lock behavior.',
        popover: 'PopoverRoot / PopoverTrigger / PopoverContent / PopoverClose',
        popoverAction: 'Open lightweight action panel',
        popoverPanel: 'Primitives own behavior contracts; UI wrappers own visuals and positioning.',
        popoverBody: 'H5 closes on Escape and outside interaction; weapp wrappers use Close or a page-level dismiss adapter.',
        radio: 'RadioGroup / RadioItem / RadioIndicator',
        radioH5: 'H5',
        radioWeapp: 'Mini Program',
        radioBody: 'RadioGroup owns one value; RadioItem and RadioIndicator consume the selected state.',
        select: 'SelectRoot',
        selectPlaceholder: 'Choose foundation layer',
        selectGroup: 'Reka-style anatomy',
        selectBody: 'SelectRoot / SelectTrigger / SelectValue / SelectContent / SelectItem share value, open, data-state, and data-placeholder contracts.',
        switch: 'SwitchRoot / SwitchThumb',
        switchBody: 'SwitchRoot manages checked, loading, and disabled; SwitchThumb only receives thumb part attributes.',
        tabs: 'TabsRoot / TabsList / TabsTrigger / TabsContent',
        tabsFoundation: 'Foundation',
        tabsBlocks: 'Blocks',
        tabsFoundationBody: 'Foundation primitives provide reusable interaction state.',
        tabsBlocksBody: 'Blocks add product layout and data on top of the same contract.',
        tabsBody: 'TabsRoot owns the current value while Trigger and Content align through data-state.',
        sticky: 'StickyRoot',
        stickyBody: 'StickyRoot exposes fixed state; the wrapper decides final visuals.'
      }
)
</script>

<template>
  <section class="primitive-demo" aria-label="Primitive interaction demo">
    <div class="primitive-demo__header">
      <h2>{{ copy.title }}</h2>
      <p>{{ copy.caption }}</p>
    </div>

    <div class="primitive-demo__grid">
      <article class="primitive-demo__card">
        <span>{{ copy.button }}</span>
        <ButtonRoot class="primitive-demo__button" @click="buttonClicks += 1">
          {{ copy.buttonAction }}
        </ButtonRoot>
        <p>{{ buttonClicks }} {{ copy.clicked }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.input }}</span>
        <InputRoot
          class="primitive-demo__input"
          :value="inputValue"
          @update:value="inputValue = $event"
        />
        <p>{{ copy.inputHint }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.checkbox }}</span>
        <CheckboxRoot v-model:checked="checkboxChecked" class="primitive-demo__choice">
          <CheckboxIndicator class="primitive-demo__choice-mark">✓</CheckboxIndicator>
          <span class="primitive-demo__choice-text">{{ copy.checkboxLabel }}</span>
        </CheckboxRoot>
        <p>{{ copy.checkboxBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.radio }}</span>
        <RadioGroup v-model:value="radioValue" class="primitive-demo__radio">
          <RadioItem class="primitive-demo__choice" value="h5">
            <RadioIndicator class="primitive-demo__radio-mark" />
            <span class="primitive-demo__choice-text">{{ copy.radioH5 }}</span>
          </RadioItem>
          <RadioItem class="primitive-demo__choice" value="weapp">
            <RadioIndicator class="primitive-demo__radio-mark" />
            <span class="primitive-demo__choice-text">{{ copy.radioWeapp }}</span>
          </RadioItem>
        </RadioGroup>
        <p>{{ copy.radioBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.switch }}</span>
        <SwitchRoot v-model:checked="switchChecked" class="primitive-demo__switch">
          <SwitchThumb class="primitive-demo__switch-thumb" />
        </SwitchRoot>
        <p>{{ copy.switchBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.tabs }}</span>
        <TabsRoot v-model:value="tabsValue" class="primitive-demo__tabs">
          <TabsList class="primitive-demo__tabs-list">
            <TabsTrigger class="primitive-demo__tabs-trigger" value="foundation">
              {{ copy.tabsFoundation }}
            </TabsTrigger>
            <TabsTrigger class="primitive-demo__tabs-trigger" value="blocks">
              {{ copy.tabsBlocks }}
            </TabsTrigger>
          </TabsList>
          <TabsContent class="primitive-demo__tabs-content" value="foundation">
            {{ copy.tabsFoundationBody }}
          </TabsContent>
          <TabsContent class="primitive-demo__tabs-content" value="blocks">
            {{ copy.tabsBlocksBody }}
          </TabsContent>
        </TabsRoot>
        <p>{{ copy.tabsBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.collapsible }}</span>
        <CollapsibleRoot v-model:open="collapsibleOpen" class="primitive-demo__collapsible">
          <CollapsibleTrigger class="primitive-demo__button">
            {{ copy.collapsibleAction }}
          </CollapsibleTrigger>
          <CollapsibleContent class="primitive-demo__disclosure-content">
            {{ copy.collapsiblePanel }}
          </CollapsibleContent>
        </CollapsibleRoot>
        <p>{{ copy.collapsibleBody }}</p>
      </article>

      <article class="primitive-demo__card primitive-demo__card--wide">
        <span>{{ copy.accordion }}</span>
        <AccordionRoot
          v-model:value="accordionValue"
          class="primitive-demo__accordion"
          collapsible
          type="single"
        >
          <AccordionItem class="primitive-demo__accordion-item" value="foundation">
            <AccordionTrigger class="primitive-demo__accordion-trigger">
              {{ copy.accordionFoundation }}
            </AccordionTrigger>
            <AccordionContent class="primitive-demo__disclosure-content">
              {{ copy.accordionFoundationBody }}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem class="primitive-demo__accordion-item" value="wrapper">
            <AccordionTrigger class="primitive-demo__accordion-trigger">
              {{ copy.accordionWrapper }}
            </AccordionTrigger>
            <AccordionContent class="primitive-demo__disclosure-content">
              {{ copy.accordionWrapperBody }}
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
        <p>{{ copy.accordionBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.popover }}</span>
        <div class="primitive-demo__popover-shell">
          <PopoverRoot v-model:open="popoverOpen">
            <PopoverTrigger class="primitive-demo__button">
              {{ copy.popoverAction }}
            </PopoverTrigger>
            <PopoverContent class="primitive-demo__popover-content">
              <p>{{ copy.popoverPanel }}</p>
              <PopoverClose class="primitive-demo__button">{{ copy.close }}</PopoverClose>
            </PopoverContent>
          </PopoverRoot>
        </div>
        <p>{{ copy.popoverBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.dialog }}</span>
        <DialogRoot v-model:open="dialogOpen">
          <DialogTrigger class="primitive-demo__button">{{ copy.dialogAction }}</DialogTrigger>
          <DialogOverlay class="primitive-demo__layer" />
          <DialogContent class="primitive-demo__floating">
            <p>{{ copy.dialogBody }}</p>
            <DialogClose class="primitive-demo__button">{{ copy.close }}</DialogClose>
          </DialogContent>
        </DialogRoot>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.overlay }}</span>
        <ButtonRoot class="primitive-demo__button" @click="overlayVisible = true">
          {{ copy.overlayAction }}
        </ButtonRoot>
        <OverlayRoot
          v-model:visible="overlayVisible"
          class="primitive-demo__layer primitive-demo__layer--soft"
        >
          <button class="primitive-demo__layer-close" type="button" @click.stop="overlayVisible = false">
            {{ copy.close }}
          </button>
        </OverlayRoot>
        <p>{{ copy.overlayBody }}</p>
      </article>

      <article class="primitive-demo__card">
        <span>{{ copy.popup }}</span>
        <ButtonRoot class="primitive-demo__button" @click="popupVisible = true">
          {{ copy.popupAction }}
        </ButtonRoot>
        <PopupRoot v-model:visible="popupVisible" class="primitive-demo__popup" closeable round>
          <p>{{ copy.popupBody }}</p>
        </PopupRoot>
      </article>

      <article class="primitive-demo__card primitive-demo__card--wide">
        <span>{{ copy.select }}</span>
        <SelectRoot v-model:value="selectValue" :options="selectOptions">
          <SelectTrigger class="primitive-demo__select-trigger">
            <SelectValue :placeholder="copy.selectPlaceholder" />
          </SelectTrigger>
          <SelectContent class="primitive-demo__select-content">
            <SelectGroup>
              <SelectLabel class="primitive-demo__select-label">{{ copy.selectGroup }}</SelectLabel>
              <SelectItem
                v-for="option in selectOptions"
                :key="option.value"
                class="primitive-demo__select-item"
                :option="option"
              >
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
        <p>{{ copy.selectBody }}</p>
      </article>

      <article class="primitive-demo__card primitive-demo__card--wide">
        <span>{{ copy.sticky }}</span>
        <StickyRoot class="primitive-demo__sticky" :offset-top="8">
          <template #default="{ fixed }">
            <strong>{{ copy.sticky }}</strong>
            <small>data-fixed={{ fixed }}</small>
          </template>
        </StickyRoot>
        <p>{{ copy.stickyBody }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.primitive-demo {
  margin: 28px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.primitive-demo__header {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}

.primitive-demo__header h2,
.primitive-demo__header p,
.primitive-demo__card p {
  margin: 0;
}

.primitive-demo__header h2 {
  font-size: 20px;
  line-height: 1.25;
}

.primitive-demo__header p,
.primitive-demo__card p {
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.primitive-demo__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.primitive-demo__card {
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: 146px;
  padding: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.primitive-demo__card--wide {
  grid-column: 1 / -1;
}

.primitive-demo__card > span {
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 700;
}

.primitive-demo__button,
.primitive-demo__input,
.primitive-demo__layer-close,
.primitive-demo__select-trigger {
  min-height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
}

.primitive-demo__button,
.primitive-demo__layer-close,
.primitive-demo__select-trigger {
  padding: 0 12px;
  cursor: pointer;
}

.primitive-demo__button:hover,
.primitive-demo__layer-close:hover,
.primitive-demo__select-trigger:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.primitive-demo__input {
  width: 100%;
  padding: 0 10px;
}

.primitive-demo__choice {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  cursor: pointer;
}

.primitive-demo__choice[data-state='checked'] {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 54%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
}

.primitive-demo__choice-mark,
.primitive-demo__radio-mark {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  font-size: 12px;
  line-height: 1;
}

.primitive-demo__choice-text {
  color: inherit;
}

.primitive-demo__radio {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.primitive-demo__radio-mark {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
}

.primitive-demo__switch {
  position: relative;
  width: 46px;
  height: 26px;
  padding: 3px;
  border: 0;
  border-radius: 999px;
  background: var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.2s ease;
}

.primitive-demo__switch[data-state='checked'] {
  background: var(--vp-c-brand-1);
}

.primitive-demo__switch-thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--vp-c-bg);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
  transform: translateX(0);
  transition: transform 0.2s ease;
}

.primitive-demo__switch[data-state='checked'] .primitive-demo__switch-thumb {
  transform: translateX(20px);
}

.primitive-demo__tabs {
  display: grid;
  gap: 8px;
}

.primitive-demo__tabs-list {
  display: flex;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.primitive-demo__tabs-trigger {
  flex: 1 1 0;
  min-height: 30px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  font: inherit;
  cursor: pointer;
}

.primitive-demo__tabs-trigger[data-state='active'] {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  box-shadow: 0 1px 5px rgba(15, 23, 42, 0.08);
}

.primitive-demo__tabs-content {
  min-height: 42px;
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.primitive-demo__collapsible,
.primitive-demo__popover-shell {
  display: grid;
  gap: 8px;
}

.primitive-demo__disclosure-content,
.primitive-demo__popover-content {
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.primitive-demo__accordion {
  display: grid;
  gap: 6px;
}

.primitive-demo__accordion-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

.primitive-demo__accordion-trigger {
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  border: 0;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.primitive-demo__accordion-trigger[data-state='open'] {
  color: var(--vp-c-brand-1);
}

.primitive-demo__accordion-item .primitive-demo__disclosure-content {
  border-width: 1px 0 0;
  border-radius: 0;
}

.primitive-demo__popover-content {
  display: grid;
  gap: 8px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.primitive-demo__layer {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.38);
}

.primitive-demo__layer--soft {
  background: rgba(8, 120, 111, 0.18);
}

.primitive-demo__floating,
.primitive-demo__popup :deep(.varo-popup__content) {
  max-width: min(360px, calc(100vw - 40px));
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.18);
}

.primitive-demo__popup :deep(.varo-popup__overlay) {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(15, 23, 42, 0.34);
}

.primitive-demo__popup :deep(.varo-popup__content) {
  position: fixed;
  left: 50%;
  bottom: 18px;
  z-index: 31;
  transform: translateX(-50%);
}

.primitive-demo__popup :deep(.varo-popup__close) {
  margin-top: 10px;
}

.primitive-demo__select-trigger {
  width: 100%;
  text-align: left;
}

.primitive-demo__select-content {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
}

.primitive-demo__select-label {
  margin-bottom: 6px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
}

.primitive-demo__select-item {
  width: 100%;
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-1);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.primitive-demo__select-item[data-state='checked'] {
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
}

.primitive-demo__select-item[data-disabled='true'] {
  color: var(--vp-c-text-3);
  cursor: not-allowed;
}

.primitive-demo__sticky {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
}

.primitive-demo__sticky small {
  color: var(--vp-c-text-2);
}

@media (max-width: 720px) {
  .primitive-demo {
    padding: 14px;
  }

  .primitive-demo__grid {
    grid-template-columns: 1fr;
  }
}
</style>
