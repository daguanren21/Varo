<script setup lang="ts">
import type { PrimitiveExampleName } from './primitiveExamples'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  ButtonRoot,
  CellGroupRoot,
  CellRoot,
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
  ImageRoot,
  InputRoot,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
  OverlayRoot,
  PopoverClose,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  PopupRoot,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  StickyRoot,
  SwitchRoot,
  SwitchThumb,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@varo/primitives-h5'
import { shallowRef } from 'vue'

defineProps<{ name: PrimitiveExampleName }>()

const buttonClicks = shallowRef(0)
const inputValue = shallowRef('Editable primitive')
const numberValue = shallowRef(2)
const dialogOpen = shallowRef(false)
const overlayVisible = shallowRef(false)
const popupVisible = shallowRef(false)
const cellClicks = shallowRef(0)
const checkboxChecked = shallowRef(false)
const radioValue = shallowRef('h5')
const switchChecked = shallowRef(false)
const tabsValue = shallowRef('a')
const selectValue = shallowRef<string | number | undefined>()
const selectOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' },
]
const collapsibleOpen = shallowRef(false)
const accordionValue = shallowRef<string | string[] | undefined>('one')
const popoverOpen = shallowRef(false)
const imageSource = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22%3E%3Crect width=%2296%22 height=%2296%22 rx=%2220%22 fill=%22%2307c160%22/%3E%3Cpath d=%22M24 28h18l14 20-14 20H24l14-20-14-20Zm32 0h16L58 48l14 20H56L42 48l14-20Z%22 fill=%22white%22/%3E%3C/svg%3E'
</script>

<template>
  <div class="primitive-example-preview">
    <ButtonRoot v-if="name === 'button'" class="pe-chip" @click="buttonClicks += 1">
      Pressed {{ buttonClicks }} times
    </ButtonRoot>

    <InputRoot
      v-else-if="name === 'input'"
      v-model:value="inputValue"
      class="pe-input"
      placeholder="Type a value"
    />

    <NumberFieldRoot
      v-else-if="name === 'number-field'"
      v-model:value="numberValue"
      :min="0"
      :max="5"
      class="pe-number-field"
    >
      <NumberFieldDecrement class="pe-chip" aria-label="Decrease">
        −
      </NumberFieldDecrement>
      <NumberFieldInput class="pe-number-input" aria-label="Value" />
      <NumberFieldIncrement class="pe-chip" aria-label="Increase">
        +
      </NumberFieldIncrement>
    </NumberFieldRoot>

    <DialogRoot v-else-if="name === 'dialog'" v-model:open="dialogOpen">
      <DialogTrigger class="pe-chip">
        Open dialog
      </DialogTrigger>
      <DialogOverlay class="pe-layer-overlay" />
      <DialogContent class="pe-layer-content">
        <strong>Dialog content</strong>
        <p>Root owns open state; Overlay and Content only render it.</p>
        <DialogClose class="pe-chip">
          Close
        </DialogClose>
      </DialogContent>
    </DialogRoot>

    <div v-else-if="name === 'overlay'" class="pe-stack">
      <ButtonRoot class="pe-chip" @click="overlayVisible = true">
        Show overlay
      </ButtonRoot>
      <OverlayRoot
        class="pe-layer-overlay pe-layer-overlay--interactive"
        :visible="overlayVisible"
        @update:visible="overlayVisible = $event"
      >
        <button class="pe-layer-content" type="button" @click.stop="overlayVisible = false">
          Close overlay
        </button>
      </OverlayRoot>
    </div>

    <div v-else-if="name === 'popup'" class="pe-stack">
      <ButtonRoot class="pe-chip" @click="popupVisible = true">
        Open popup
      </ButtonRoot>
      <PopupRoot
        v-model:visible="popupVisible"
        class="pe-popup"
        position="bottom"
        round
        closeable
      >
        <strong>Popup content</strong>
        <p>Position, overlay dismiss, and close state share one contract.</p>
      </PopupRoot>
    </div>

    <ImageRoot
      v-else-if="name === 'image'"
      class="pe-image"
      :src="imageSource"
      alt="Varo runtime mark"
      fit="contain"
      :width="96"
      :height="96"
      :radius="18"
      loading-text="Loading"
      error-text="Unable to load"
    />

    <StickyRoot v-else-if="name === 'sticky'" class="pe-sticky" :offset-top="8">
      <template #default="{ fixed }">
        <strong>StickyRoot</strong>
        <span>data-fixed={{ fixed }}</span>
      </template>
    </StickyRoot>

    <CellGroupRoot v-else-if="name === 'cell'" class="pe-cell-group" title="Settings">
      <CellRoot
        class="pe-cell"
        title="Notifications"
        sub-title="Primitive row"
        :desc="`${cellClicks} activations`"
        clickable
        is-link
        @click="cellClicks += 1"
      />
    </CellGroupRoot>

    <CheckboxRoot v-else-if="name === 'checkbox'" v-model:checked="checkboxChecked" class="pe-chip">
      <CheckboxIndicator class="pe-mark">
        ✓
      </CheckboxIndicator>
      <span>Enable state</span>
    </CheckboxRoot>

    <RadioGroup v-else-if="name === 'radio-group'" v-model:value="radioValue" class="pe-stack">
      <RadioItem value="h5" class="pe-chip">
        <RadioIndicator class="pe-dot">
          •
        </RadioIndicator>
        <span>H5</span>
      </RadioItem>
      <RadioItem value="weapp" class="pe-chip">
        <RadioIndicator class="pe-dot">
          •
        </RadioIndicator>
        <span>Weapp</span>
      </RadioItem>
    </RadioGroup>

    <SwitchRoot v-else-if="name === 'switch'" v-model:checked="switchChecked" class="pe-switch" type="button">
      <SwitchThumb class="pe-switch-thumb" />
    </SwitchRoot>

    <TabsRoot v-else-if="name === 'tabs'" v-model:value="tabsValue" class="pe-stack">
      <TabsList class="pe-row">
        <TabsTrigger value="a" class="pe-chip">
          A
        </TabsTrigger>
        <TabsTrigger value="b" class="pe-chip">
          B
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a" class="pe-panel">
        Panel A
      </TabsContent>
      <TabsContent value="b" class="pe-panel">
        Panel B
      </TabsContent>
    </TabsRoot>

    <div v-else-if="name === 'select'" class="pe-float">
      <SelectRoot v-model:value="selectValue" :options="selectOptions">
        <SelectTrigger class="pe-chip pe-chip--trigger" type="button">
          <span class="pe-trigger-label">
            <SelectValue placeholder="Pick a layer" />
          </span>
          <span class="pe-caret" aria-hidden="true" />
        </SelectTrigger>
        <SelectContent class="pe-menu pe-menu--floating">
          <span class="pe-menu-arrow" aria-hidden="true" />
          <SelectItem
            v-for="option in selectOptions"
            :key="String(option.value)"
            :option="option"
            class="pe-item"
            type="button"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </SelectRoot>
    </div>

    <CollapsibleRoot v-else-if="name === 'collapsible'" v-model:open="collapsibleOpen" class="pe-stack">
      <CollapsibleTrigger class="pe-chip">
        Toggle details
      </CollapsibleTrigger>
      <CollapsibleContent class="pe-panel">
        Hidden content becomes visible when open.
      </CollapsibleContent>
    </CollapsibleRoot>

    <AccordionRoot
      v-else-if="name === 'accordion'"
      v-model:value="accordionValue"
      type="single"
      collapsible
      class="pe-stack"
    >
      <AccordionItem value="one" class="pe-panel">
        <AccordionTrigger class="pe-chip">
          One
        </AccordionTrigger>
        <AccordionContent>Body one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two" class="pe-panel">
        <AccordionTrigger class="pe-chip">
          Two
        </AccordionTrigger>
        <AccordionContent>Body two</AccordionContent>
      </AccordionItem>
    </AccordionRoot>

    <div v-else-if="name === 'popover'" class="pe-float">
      <PopoverRoot v-model:open="popoverOpen">
        <PopoverTrigger class="pe-chip pe-chip--trigger" type="button">
          <span class="pe-trigger-label">Open</span>
          <span class="pe-caret" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent class="pe-menu pe-menu--floating">
          <span class="pe-menu-arrow" aria-hidden="true" />
          <div class="pe-menu-body">
            Lightweight floating content
          </div>
          <PopoverClose class="pe-chip" type="button">
            Close
          </PopoverClose>
        </PopoverContent>
      </PopoverRoot>
    </div>
  </div>
</template>

<style scoped>
.primitive-example-preview {
  display: grid;
  gap: 10px;
}

.pe-stack {
  display: grid;
  gap: 8px;
}

.pe-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pe-chip,
.pe-switch,
.pe-item {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  color: var(--varo-foreground);
  cursor: pointer;
  background: color-mix(in srgb, var(--varo-demo-surface-strong, var(--varo-card-solid)) 92%, transparent);
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 999px;
}

.pe-switch {
  justify-content: flex-start;
  width: 52px;
  min-height: 30px;
  padding: 3px;
  background: color-mix(in srgb, var(--varo-foreground) 18%, transparent);
  border-radius: 999px;
  transition: background 0.18s ease;
}

.pe-switch[data-state='checked'] {
  background: color-mix(in srgb, var(--varo-primary) 88%, #fff);
}

.pe-switch-thumb {
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px color-mix(in srgb, var(--varo-foreground) 24%, transparent);
  transition: transform 0.18s ease;
}

.pe-switch[data-state='checked'] .pe-switch-thumb {
  transform: translateX(22px);
}

.pe-mark,
.pe-dot {
  font-weight: 800;
  color: var(--varo-primary);
}

.pe-panel,
.pe-menu {
  padding: 12px;
  background: color-mix(in srgb, var(--varo-demo-surface, var(--varo-card-solid)) 94%, transparent);
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 14px;
}

.pe-menu {
  display: grid;
  gap: 8px;
}

.pe-item {
  justify-content: flex-start;
  width: 100%;
  border-radius: 10px;
}

.pe-float {
  position: relative;
  display: grid;
  gap: 8px;
  justify-items: stretch;
  width: 100%;
}

.pe-chip--trigger {
  display: inline-flex;
  gap: 12px;
  justify-content: space-between;
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
}

.pe-trigger-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  white-space: nowrap;
}

.pe-caret {
  flex: none;
  width: 8px;
  height: 8px;
  margin-left: auto;
  border-right: 1.6px solid currentcolor;
  border-bottom: 1.6px solid currentcolor;
  opacity: 0.8;
  transform: translateY(-1px) rotate(45deg);
  transition: transform 0.18s ease;
}

.pe-chip--trigger[data-state='open'] .pe-caret,
.pe-float:has([data-state='open']) .pe-caret {
  transform: translateY(2px) rotate(225deg);
}

.pe-menu--floating {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  left: 0;
  z-index: 40;
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 14px 12px 12px;
  background: var(--varo-card-solid, #fff);
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 14px;
  box-shadow:
    0 18px 40px color-mix(in srgb, var(--varo-foreground) 16%, transparent),
    0 2px 8px color-mix(in srgb, var(--varo-foreground) 8%, transparent);
}

.pe-menu-arrow {
  position: absolute;
  top: -6px;
  right: 18px;
  left: auto;
  width: 12px;
  height: 12px;
  background: var(--varo-card-solid, #fff);
  border-top: 1px solid var(--varo-demo-border, var(--varo-border));
  border-left: 1px solid var(--varo-demo-border, var(--varo-border));
  border-top-left-radius: 3px;
  box-shadow: -2px -2px 6px color-mix(in srgb, var(--varo-foreground) 6%, transparent);
  transform: rotate(45deg);
}

.pe-menu-body {
  font-size: 13px;
  line-height: 1.5;
  color: var(--varo-foreground);
}

.pe-input,
.pe-number-input {
  box-sizing: border-box;
  min-height: 40px;
  padding: 0 12px;
  color: var(--varo-foreground);
  outline: 0;
  background: var(--varo-demo-surface-strong, var(--varo-card-solid));
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 10px;
}

.pe-input {
  width: 100%;
}

.pe-input:focus,
.pe-number-input:focus {
  border-color: var(--varo-primary);
  box-shadow: 0 0 0 3px var(--varo-ring);
}

.pe-number-field {
  display: grid;
  grid-template-columns: auto minmax(72px, 104px) auto;
  gap: 8px;
  align-items: center;
  justify-content: start;
}

.pe-number-input {
  width: 100%;
  text-align: center;
}

.pe-image {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--varo-demo-surface-strong, var(--varo-card-solid));
  border: 1px solid var(--varo-demo-border, var(--varo-border));
}

.pe-image :deep(.varo-image__img) {
  display: block;
  width: 100%;
  height: 100%;
}

.pe-sticky {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 14px;
  color: var(--varo-foreground);
  background: var(--varo-demo-surface-strong, var(--varo-card-solid));
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 12px;
}

.pe-sticky span {
  font-size: 12px;
  color: var(--varo-muted);
}

.pe-cell-group {
  overflow: hidden;
  color: var(--varo-foreground);
  background: var(--varo-demo-surface, var(--varo-card-solid));
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 14px;
}

.pe-cell-group :deep(.varo-cell-group__header) {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 750;
  color: var(--varo-muted);
  background: var(--varo-demo-surface-strong, var(--varo-fill-light));
  border-bottom: 1px solid var(--varo-demo-border, var(--varo-border));
}

.pe-cell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  min-height: 58px;
  padding: 0 14px;
  cursor: pointer;
}

.pe-cell :deep(.varo-cell__title) {
  font-weight: 700;
}

.pe-cell :deep(.varo-cell__subtitle),
.pe-cell :deep(.varo-cell__desc) {
  font-size: 12px;
  color: var(--varo-muted);
}

.pe-layer-overlay,
.pe-popup :deep(.varo-popup__overlay) {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgb(0 0 0 / 58%);
  backdrop-filter: blur(4px);
}

.pe-layer-overlay--interactive {
  display: grid;
  place-items: center;
}

.pe-layer-content {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 91;
  display: grid;
  gap: 12px;
  width: min(360px, calc(100vw - 32px));
  padding: 20px;
  color: var(--varo-foreground);
  text-align: left;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
  box-shadow: var(--varo-shadow);
  transform: translate(-50%, -50%);
}

.pe-layer-content p,
.pe-popup :deep(.varo-popup__content p) {
  margin: 0;
  color: var(--varo-muted);
}

button.pe-layer-content {
  min-height: 52px;
  font: inherit;
  text-align: center;
  cursor: pointer;
}

.pe-popup :deep(.varo-popup__content) {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 91;
  display: grid;
  gap: 8px;
  max-width: 560px;
  padding: 24px;
  margin: auto;
  color: var(--varo-foreground);
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 20px 20px 0 0;
  box-shadow: var(--varo-shadow);
}

.pe-popup :deep(.varo-popup__close) {
  position: absolute;
  top: 12px;
  right: 12px;
  min-width: 32px;
  min-height: 32px;
  color: var(--varo-foreground);
  background: var(--varo-fill-light);
  border: 1px solid var(--varo-border);
  border-radius: 999px;
}

.pe-chip:focus-visible,
.pe-cell:focus-visible,
.pe-layer-content:focus-visible,
.pe-popup :deep(.varo-popup__close:focus-visible) {
  outline: 2px solid var(--varo-primary);
  outline-offset: 2px;
}
</style>
