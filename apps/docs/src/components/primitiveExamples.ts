export type Locale = 'zh' | 'en'
export type PrimitiveExampleName
  = | 'button'
    | 'input'
    | 'number-field'
    | 'image'
    | 'cell'
    | 'sticky'
    | 'checkbox'
    | 'radio-group'
    | 'switch'
    | 'tabs'
    | 'select'
    | 'collapsible'
    | 'accordion'
    | 'popover'
    | 'dialog'
    | 'overlay'
    | 'popup'

export interface PrimitiveExampleData {
  h5Code: string
  weappCode: string
  contractRows: Array<{ label: string, value: string }>
}

function dualRuntimeExample(source: string) {
  return {
    h5: source
      .replaceAll('__FRAMEWORK__', 'vue')
      .replaceAll('__PACKAGE__', '@varo-ui/h5/primitives'),
    weapp: source
      .replaceAll('__FRAMEWORK__', 'wevu')
      .replaceAll('__PACKAGE__', '@varo-ui/weapp/primitives'),
  }
}

const checkbox = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { CheckboxRoot, CheckboxIndicator } from '@varo-ui/h5/primitives'

const checked = ref(false)
</script>

<template>
  <CheckboxRoot v-model:checked="checked">
    <CheckboxIndicator>✓</CheckboxIndicator>
    Enable state
  </CheckboxRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import { CheckboxRoot, CheckboxIndicator } from '@varo-ui/weapp/primitives'

const checked = ref(false)
</script>

<template>
  <CheckboxRoot v-model:checked="checked">
    <CheckboxIndicator>✓</CheckboxIndicator>
    Enable state
  </CheckboxRoot>
</template>`,
}

const radio = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioItem, RadioIndicator } from '@varo-ui/h5/primitives'

const value = ref('h5')
</script>

<template>
  <RadioGroup v-model:value="value">
    <RadioItem value="h5"><RadioIndicator>•</RadioIndicator>H5</RadioItem>
    <RadioItem value="weapp"><RadioIndicator>•</RadioIndicator>Weapp</RadioItem>
  </RadioGroup>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import { RadioGroup, RadioItem, RadioIndicator } from '@varo-ui/weapp/primitives'

const value = ref('h5')
</script>

<template>
  <RadioGroup v-model:value="value">
    <RadioItem value="h5"><RadioIndicator>•</RadioIndicator>H5</RadioItem>
    <RadioItem value="weapp"><RadioIndicator>•</RadioIndicator>Weapp</RadioItem>
  </RadioGroup>
</template>`,
}

const switchExample = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { SwitchRoot, SwitchThumb } from '@varo-ui/h5/primitives'

const on = ref(false)
</script>

<template>
  <SwitchRoot v-model:checked="on">
    <SwitchThumb />
  </SwitchRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import { SwitchRoot, SwitchThumb } from '@varo-ui/weapp/primitives'

const on = ref(false)
</script>

<template>
  <SwitchRoot v-model:checked="on">
    <SwitchThumb />
  </SwitchRoot>
</template>`,
}

const tabs = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@varo-ui/h5/primitives'

const tab = ref('a')
</script>

<template>
  <TabsRoot v-model:value="tab">
    <TabsList>
      <TabsTrigger value="a">A</TabsTrigger>
      <TabsTrigger value="b">B</TabsTrigger>
    </TabsList>
    <TabsContent value="a">Panel A</TabsContent>
    <TabsContent value="b">Panel B</TabsContent>
  </TabsRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@varo-ui/weapp/primitives'

const tab = ref('a')
</script>

<template>
  <TabsRoot v-model:value="tab">
    <TabsList>
      <TabsTrigger value="a">A</TabsTrigger>
      <TabsTrigger value="b">B</TabsTrigger>
    </TabsList>
    <TabsContent value="a">Panel A</TabsContent>
    <TabsContent value="b">Panel B</TabsContent>
  </TabsRoot>
</template>`,
}

const select = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@varo-ui/h5/primitives'

const value = ref()
const options = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
</script>

<template>
  <SelectRoot v-model:value="value" :options="options">
    <SelectTrigger>
      <SelectValue placeholder="Pick a layer" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :option="option">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@varo-ui/weapp/primitives'

const value = ref()
const options = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
</script>

<template>
  <SelectRoot v-model:value="value" :options="options">
    <SelectTrigger>
      <SelectValue placeholder="Pick a layer" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :option="option">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>`,
}

const collapsible = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent
} from '@varo-ui/h5/primitives'

const open = ref(false)
</script>

<template>
  <CollapsibleRoot v-model:open="open">
    <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
    <CollapsibleContent>Hidden content becomes visible when open.</CollapsibleContent>
  </CollapsibleRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent
} from '@varo-ui/weapp/primitives'

const open = ref(false)
</script>

<template>
  <CollapsibleRoot v-model:open="open">
    <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
    <CollapsibleContent>Hidden content becomes visible when open.</CollapsibleContent>
  </CollapsibleRoot>
</template>`,
}

const accordion = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@varo-ui/h5/primitives'

const value = ref('one')
</script>

<template>
  <AccordionRoot v-model:value="value" type="single" collapsible>
    <AccordionItem value="one">
      <AccordionTrigger>One</AccordionTrigger>
      <AccordionContent>Body one</AccordionContent>
    </AccordionItem>
    <AccordionItem value="two">
      <AccordionTrigger>Two</AccordionTrigger>
      <AccordionContent>Body two</AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@varo-ui/weapp/primitives'

const value = ref('one')
</script>

<template>
  <AccordionRoot v-model:value="value" type="single" collapsible>
    <AccordionItem value="one">
      <AccordionTrigger>One</AccordionTrigger>
      <AccordionContent>Body one</AccordionContent>
    </AccordionItem>
    <AccordionItem value="two">
      <AccordionTrigger>Two</AccordionTrigger>
      <AccordionContent>Body two</AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>`,
}

const popover = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose
} from '@varo-ui/h5/primitives'

const open = ref(false)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent>
      Lightweight floating content
      <PopoverClose>Close</PopoverClose>
    </PopoverContent>
  </PopoverRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'wevu'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose
} from '@varo-ui/weapp/primitives'

const open = ref(false)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent>
      Lightweight floating content
      <PopoverClose>Close</PopoverClose>
    </PopoverContent>
  </PopoverRoot>
</template>`,
}

const button = dualRuntimeExample(`<script setup lang="ts">
import { ButtonRoot } from '__PACKAGE__'
</script>

<template>
  <ButtonRoot @click="onPress">
    Press
  </ButtonRoot>
</template>`)

const inputExample = dualRuntimeExample(`<script setup lang="ts">
import { shallowRef } from '__FRAMEWORK__'
import { InputRoot } from '__PACKAGE__'

const value = shallowRef('')
</script>

<template>
  <InputRoot v-model:value="value" placeholder="Type a value" />
</template>`)

const numberField = dualRuntimeExample(`<script setup lang="ts">
import { shallowRef } from '__FRAMEWORK__'
import {
  NumberFieldRoot,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement
} from '__PACKAGE__'

const value = shallowRef(2)
</script>

<template>
  <NumberFieldRoot v-model:value="value" :min="0" :max="5">
    <NumberFieldDecrement>−</NumberFieldDecrement>
    <NumberFieldInput />
    <NumberFieldIncrement>+</NumberFieldIncrement>
  </NumberFieldRoot>
</template>`)

const imageExample = dualRuntimeExample(`<script setup lang="ts">
import { ImageRoot } from '__PACKAGE__'
</script>

<template>
  <ImageRoot
    src="/avatar.png"
    alt="Profile"
    fit="cover"
    :width="96"
    :height="96"
    :radius="16"
  />
</template>`)

const cell = dualRuntimeExample(`<script setup lang="ts">
import { CellGroupRoot, CellRoot } from '__PACKAGE__'
</script>

<template>
  <CellGroupRoot title="Settings">
    <CellRoot
      title="Notifications"
      sub-title="Primitive row"
      desc="Enabled"
      clickable
      is-link
      @click="openSettings"
    />
  </CellGroupRoot>
</template>`)

const sticky = dualRuntimeExample(`<script setup lang="ts">
import { StickyRoot } from '__PACKAGE__'
</script>

<template>
  <StickyRoot :offset-top="8">
    <template #default="{ fixed }">
      Sticky · data-fixed={{ fixed }}
    </template>
  </StickyRoot>
</template>`)

const dialog = dualRuntimeExample(`<script setup lang="ts">
import { shallowRef } from '__FRAMEWORK__'
import {
  DialogRoot,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogClose
} from '__PACKAGE__'

const open = shallowRef(false)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>Open dialog</DialogTrigger>
    <DialogOverlay />
    <DialogContent>
      Dialog content
      <DialogClose>Close</DialogClose>
    </DialogContent>
  </DialogRoot>
</template>`)

const overlay = dualRuntimeExample(`<script setup lang="ts">
import { shallowRef } from '__FRAMEWORK__'
import { ButtonRoot, OverlayRoot } from '__PACKAGE__'

const visible = shallowRef(false)
</script>

<template>
  <ButtonRoot @click="visible = true">Show overlay</ButtonRoot>
  <OverlayRoot v-model:visible="visible" @click="visible = false" />
</template>`)

const popup = dualRuntimeExample(`<script setup lang="ts">
import { shallowRef } from '__FRAMEWORK__'
import { ButtonRoot, PopupRoot } from '__PACKAGE__'

const visible = shallowRef(false)
</script>

<template>
  <ButtonRoot @click="visible = true">Open popup</ButtonRoot>
  <PopupRoot
    v-model:visible="visible"
    position="bottom"
    round
    closeable
  >
    Popup content
  </PopupRoot>
</template>`)

const catalog: Record<PrimitiveExampleName, { h5: string, weapp: string }> = {
  button,
  'input': inputExample,
  'number-field': numberField,
  'image': imageExample,
  cell,
  sticky,
  checkbox,
  'radio-group': radio,
  'switch': switchExample,
  tabs,
  select,
  collapsible,
  accordion,
  popover,
  dialog,
  overlay,
  popup,
}

const contractsZh: Record<PrimitiveExampleName, Array<{ label: string, value: string }>> = {
  'checkbox': [
    { label: '状态', value: 'checked / disabled' },
    { label: '事件', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'CheckboxRoot, CheckboxIndicator' },
    { label: '差异', value: '不模拟浏览器焦点环' },
  ],
  'radio-group': [
    { label: '状态', value: 'value / disabled' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'RadioGroup, RadioItem, RadioIndicator' },
    { label: '差异', value: '选项焦点由页面容器处理' },
  ],
  'switch': [
    { label: '状态', value: 'checked / disabled / loading' },
    { label: '事件', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'SwitchRoot, SwitchThumb' },
    { label: '差异', value: 'loading 时保持不可切换' },
  ],
  'tabs': [
    { label: '状态', value: 'value / orientation / disabled' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'TabsRoot, TabsList, TabsTrigger, TabsContent' },
    { label: '差异', value: 'H5 支持方向键；小程序保留 ARIA 与 value 关联' },
  ],
  'select': [
    { label: '状态', value: 'value / open / disabled / readonly' },
    { label: '事件', value: 'update:value, valueChange, update:open, openChange' },
    { label: 'Parts', value: 'SelectRoot, Trigger, Value, Content, Item' },
    { label: '差异', value: '浮层定位由 UI wrapper 负责' },
  ],
  'collapsible': [
    { label: '状态', value: 'open / disabled' },
    { label: '事件', value: 'update:open, openChange' },
    { label: 'Parts', value: 'CollapsibleRoot, Trigger, Content' },
    { label: '差异', value: '动画与高度过渡留给 UI 层' },
  ],
  'accordion': [
    { label: '状态', value: 'value / type / collapsible / disabled' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'AccordionRoot, Item, Trigger, Content' },
    { label: '差异', value: 'item value 必须唯一' },
  ],
  'popover': [
    { label: '状态', value: 'open / disabled' },
    { label: '事件', value: 'update:open, openChange' },
    { label: 'Parts', value: 'PopoverRoot, Trigger, Content, Close' },
    { label: '差异', value: '小程序用显式 Close/遮罩 dismiss，不依赖 document' },
  ],
  'button': [
    { label: '状态', value: 'pressed / disabled / loading' },
    { label: '事件', value: 'click 与 press 生命周期' },
    { label: 'Parts', value: 'ButtonRoot / usePressableRoot' },
    { label: '差异', value: '平台适配原生按压反馈与禁用行为' },
  ],
  'input': [
    { label: '状态', value: 'value / disabled / readonly / invalid' },
    { label: '事件', value: 'update:value, valueChange, focus, blur' },
    { label: 'Parts', value: 'InputRoot / useFieldRoot' },
    { label: '差异', value: '输入法、formatter 与 autosize 由平台适配' },
  ],
  'number-field': [
    { label: '状态', value: 'value / min / max / step / precision' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'NumberFieldRoot, Decrement, Input, Increment' },
    { label: '差异', value: '边界与精度逻辑跨端一致' },
  ],
  'image': [
    { label: '状态', value: 'loading / loaded / error / src' },
    { label: '事件', value: 'load, error, click' },
    { label: 'Parts', value: 'ImageRoot / useImageRoot' },
    { label: '差异', value: 'DOM img 与小程序 image 各自渲染' },
  ],
  'cell': [
    { label: '状态', value: 'clickable / link / size / alignment' },
    { label: '事件', value: 'click' },
    { label: 'Parts', value: 'CellGroupRoot, CellRoot' },
    { label: '差异', value: 'H5 键盘激活，小程序使用原生点击' },
  ],
  'sticky': [
    { label: '状态', value: 'fixed / disabled / offsetTop' },
    { label: '事件', value: 'change, scroll' },
    { label: 'Parts', value: 'StickyRoot' },
    { label: '差异', value: '平台分别观察 window 与页面滚动' },
  ],
  'dialog': [
    { label: '状态', value: 'open / disabled' },
    { label: '事件', value: 'update:open, openChange' },
    { label: 'Parts', value: 'DialogRoot, Trigger, Overlay, Content, Close' },
    { label: '差异', value: 'H5 支持 Escape；焦点管理由 wrapper 加强' },
  ],
  'overlay': [
    { label: '状态', value: 'visible / disabled / lockScroll' },
    { label: '事件', value: 'update:visible, visibleChange, close, click' },
    { label: 'Parts', value: 'OverlayRoot' },
    { label: '差异', value: '滚动锁定由平台适配' },
  ],
  'popup': [
    { label: '状态', value: 'visible / position / overlay / closeable' },
    { label: '事件', value: 'update:visible, visibleChange, close, clickOverlay' },
    { label: 'Parts', value: 'PopupRoot' },
    { label: '差异', value: '安全区与定位由目标运行时实现' },
  ],
}

const contractsEn: Record<PrimitiveExampleName, Array<{ label: string, value: string }>> = {
  'checkbox': [
    { label: 'State', value: 'checked / disabled' },
    { label: 'Events', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'CheckboxRoot, CheckboxIndicator' },
    { label: 'Difference', value: 'No browser focus-ring simulation' },
  ],
  'radio-group': [
    { label: 'State', value: 'value / disabled' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'RadioGroup, RadioItem, RadioIndicator' },
    { label: 'Difference', value: 'Option focus stays page-owned' },
  ],
  'switch': [
    { label: 'State', value: 'checked / disabled / loading' },
    { label: 'Events', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'SwitchRoot, SwitchThumb' },
    { label: 'Difference', value: 'Loading keeps the control non-toggleable' },
  ],
  'tabs': [
    { label: 'State', value: 'value / orientation / disabled' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'TabsRoot, TabsList, TabsTrigger, TabsContent' },
    { label: 'Difference', value: 'H5 arrow keys; Weapp keeps ARIA and value association' },
  ],
  'select': [
    { label: 'State', value: 'value / open / disabled / readonly' },
    { label: 'Events', value: 'update:value, valueChange, update:open, openChange' },
    { label: 'Parts', value: 'SelectRoot, Trigger, Value, Content, Item' },
    { label: 'Difference', value: 'Floating placement belongs to UI wrappers' },
  ],
  'collapsible': [
    { label: 'State', value: 'open / disabled' },
    { label: 'Events', value: 'update:open, openChange' },
    { label: 'Parts', value: 'CollapsibleRoot, Trigger, Content' },
    { label: 'Difference', value: 'Height animation stays in the UI layer' },
  ],
  'accordion': [
    { label: 'State', value: 'value / type / collapsible / disabled' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'AccordionRoot, Item, Trigger, Content' },
    { label: 'Difference', value: 'Item values must stay unique' },
  ],
  'popover': [
    { label: 'State', value: 'open / disabled' },
    { label: 'Events', value: 'update:open, openChange' },
    { label: 'Parts', value: 'PopoverRoot, Trigger, Content, Close' },
    { label: 'Difference', value: 'Weapp dismiss uses explicit Close/mask, not document events' },
  ],
  'button': [
    { label: 'State', value: 'pressed / disabled / loading' },
    { label: 'Events', value: 'click and press lifecycle' },
    { label: 'Parts', value: 'ButtonRoot / usePressableRoot' },
    { label: 'Difference', value: 'Each runtime adapts native pressed and disabled feedback' },
  ],
  'input': [
    { label: 'State', value: 'value / disabled / readonly / invalid' },
    { label: 'Events', value: 'update:value, valueChange, focus, blur' },
    { label: 'Parts', value: 'InputRoot / useFieldRoot' },
    { label: 'Difference', value: 'IME, formatter, and autosize stay runtime-owned' },
  ],
  'number-field': [
    { label: 'State', value: 'value / min / max / step / precision' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'NumberFieldRoot, Decrement, Input, Increment' },
    { label: 'Difference', value: 'Bounds and precision stay aligned across targets' },
  ],
  'image': [
    { label: 'State', value: 'loading / loaded / error / src' },
    { label: 'Events', value: 'load, error, click' },
    { label: 'Parts', value: 'ImageRoot / useImageRoot' },
    { label: 'Difference', value: 'DOM img and native mini-program image render separately' },
  ],
  'cell': [
    { label: 'State', value: 'clickable / link / size / alignment' },
    { label: 'Events', value: 'click' },
    { label: 'Parts', value: 'CellGroupRoot, CellRoot' },
    { label: 'Difference', value: 'H5 adds keyboard activation; Weapp uses native tap' },
  ],
  'sticky': [
    { label: 'State', value: 'fixed / disabled / offsetTop' },
    { label: 'Events', value: 'change, scroll' },
    { label: 'Parts', value: 'StickyRoot' },
    { label: 'Difference', value: 'Each runtime observes its own scrolling surface' },
  ],
  'dialog': [
    { label: 'State', value: 'open / disabled' },
    { label: 'Events', value: 'update:open, openChange' },
    { label: 'Parts', value: 'DialogRoot, Trigger, Overlay, Content, Close' },
    { label: 'Difference', value: 'H5 supports Escape; wrappers strengthen focus management' },
  ],
  'overlay': [
    { label: 'State', value: 'visible / disabled / lockScroll' },
    { label: 'Events', value: 'update:visible, visibleChange, close, click' },
    { label: 'Parts', value: 'OverlayRoot' },
    { label: 'Difference', value: 'Scroll locking is runtime-adapted' },
  ],
  'popup': [
    { label: 'State', value: 'visible / position / overlay / closeable' },
    { label: 'Events', value: 'update:visible, visibleChange, close, clickOverlay' },
    { label: 'Parts', value: 'PopupRoot' },
    { label: 'Difference', value: 'Safe area and placement are target-owned' },
  ],
}

export function resolvePrimitiveExample(
  name: PrimitiveExampleName,
  locale: Locale = 'zh',
): PrimitiveExampleData {
  const sample = catalog[name]
  return {
    h5Code: sample.h5,
    weappCode: sample.weapp,
    contractRows: locale === 'en' ? contractsEn[name] : contractsZh[name],
  }
}
