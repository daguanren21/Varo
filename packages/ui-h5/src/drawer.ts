// Generated from registry/components/drawer/drawer.ts; edit the Registry source.
import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import type { PropType, StyleValue } from 'vue'
import type { DrawerPlacement } from '@varo/primitives-h5'
import { createVariantClass } from '@varo-ui/headless'
import { computed, defineComponent, getCurrentInstance, h } from 'vue'
import { DrawerClose, DrawerContent, DrawerOverlay, DrawerRoot } from '@varo/primitives-h5'
import './styles/varo.css'
import './styles/varo-drawer.css'

const hasOwn = Object.prototype.hasOwnProperty
type DrawerDimension = number | string
function elevatedZIndex(value: DrawerDimension) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue + 1 : value
}

export const VDrawer = defineComponent({
  name: 'VDrawer',
  props: {
    defaultOpen: Boolean,
    open: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    placement: { type: String as PropType<DrawerPlacement>, default: 'right' },
    disabled: Boolean,
    overlay: { type: Boolean, default: true },
    closeable: Boolean,
    closeIcon: { type: String, default: '×' },
    round: Boolean,
    safeAreaInsetBottom: Boolean,
    lockScroll: { type: Boolean, default: true },
    closeOnClickOverlay: { type: Boolean, default: true },
    zIndex: { type: [Number, String] as PropType<DrawerDimension | undefined>, default: undefined },
  },
  emits: ['update:open', 'openChange', 'close', 'clickOverlay'],
  setup(props, { attrs, emit, slots }) {
    const instance = getCurrentInstance()
    const openControlled = computed(() => {
      const vnodeProps = instance?.vnode.props
      return vnodeProps ? hasOwn.call(vnodeProps, 'open') : false
    })
    const classes = computed(() => createVariantClass('varo-drawer', {
      closeable: props.closeable,
      placement: props.placement,
      round: props.round,
    }))

    return () => {
      const { class: className, style, ...rootAttrs } = attrs
      return h(
        DrawerRoot,
        {
          ...rootAttrs,
          ...openControlled.value ? { open: props.open } : {},
          'class': [classes.value, className],
          'style': style as StyleValue,
          'closeOnOverlayClick': props.closeOnClickOverlay,
          'defaultOpen': props.defaultOpen,
          'disabled': props.disabled,
          'lockScroll': props.lockScroll,
          'onOpenChange': (open: boolean, details: DialogOpenChangeDetails) => {
            emit('openChange', open, details)
          },
          'onUpdate:open': (open: boolean) => {
            emit('update:open', open)
            if (!open) { emit('close') }
          },
          'placement': props.placement,
        },
        {
          default: () => [
            props.overlay
              ? h(DrawerOverlay, { class: 'varo-drawer__overlay', onClick: () => emit('clickOverlay') })
              : null,
            h(DrawerContent, {
              'class': 'varo-drawer__content',
              'data-round': String(props.round),
              'data-safe-area-inset-bottom': String(props.safeAreaInsetBottom),
              'style': props.zIndex == null ? undefined : { zIndex: elevatedZIndex(props.zIndex) },
            }, {
              default: () => [
                slots.default?.(),
                props.closeable
                  ? h(DrawerClose, { 'class': 'varo-drawer__close', 'aria-label': 'Close drawer', 'type': 'button' }, {
                      default: () => slots.closeIcon?.() ?? props.closeIcon,
                    })
                  : null,
              ],
            }),
          ],
        },
      )
    }
  },
})
