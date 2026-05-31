import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import { CellGroupRoot, CellRoot, type CellDescTextAlign, type CellSize } from '@varo/primitives-h5'

const cellProps = {
  title: String,
  subTitle: String,
  desc: String,
  descTextAlign: {
    type: String as PropType<CellDescTextAlign>,
    default: 'right'
  },
  icon: String,
  isLink: Boolean,
  to: String,
  roundRadius: String,
  center: Boolean,
  size: {
    type: String as PropType<CellSize>,
    default: 'default'
  },
  clickable: Boolean,
  titleWidth: {
    type: [Number, String] as PropType<number | string | undefined>,
    default: undefined
  }
}

export const VCell = defineComponent({
  name: 'VCell',
  props: cellProps,
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    const clickable = computed(() => props.clickable || props.isLink || Boolean(props.to))
    const classes = computed(() =>
      createVariantClass('varo-cell', {
        size: props.size,
        center: props.center,
        clickable: clickable.value,
        link: props.isLink || Boolean(props.to)
      })
    )

    return () =>
      h(
        CellRoot,
        {
          ...attrs,
          center: props.center,
          clickable: props.clickable,
          class: [classes.value, attrs.class],
          desc: props.desc,
          descTextAlign: props.descTextAlign,
          icon: props.icon,
          isLink: props.isLink,
          roundRadius: props.roundRadius,
          size: props.size,
          style: attrs.style as StyleValue,
          subTitle: props.subTitle,
          title: props.title,
          titleWidth: props.titleWidth,
          to: props.to,
          onClick: (event: MouseEvent) => emit('click', event)
        },
        slots
      )
  }
})

export const VCellGroup = defineComponent({
  name: 'VCellGroup',
  props: {
    title: String,
    desc: String
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        CellGroupRoot,
        {
          ...attrs,
          class: ['varo-cell-group', attrs.class],
          desc: props.desc,
          title: props.title
        },
        slots
      )
  }
})
