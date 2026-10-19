import type { PropType } from 'vue'
import type { FileTypeSize } from './file-type-utils'
import { computed, defineComponent, h } from 'vue'
import { VIcon } from './icon'
import { classifyFileType } from './file-type-utils'
import '../../styles/varo.css'
import '../../styles/varo-icon.css'
import '../../styles/varo-file-type.css'

export { classifyFileType } from './file-type-utils'
export type { FileTypeFamily, FileTypeInfo, FileTypeSize } from './file-type-utils'

export const VFileType = defineComponent({
  name: 'VFileType',
  inheritAttrs: false,
  props: {
    decorative: Boolean,
    filename: { type: String, default: '' },
    label: String,
    mimeType: { type: String, default: '' },
    size: { type: String as PropType<FileTypeSize>, default: 'md' },
  },
  setup(props, { attrs }) {
    const fileType = computed(() => classifyFileType(props.filename, props.mimeType))
    const iconSize = computed(() => props.size === 'sm' ? 12 : props.size === 'lg' ? 20 : 16)
    return () => h('span', {
      ...attrs,
      'class': ['varo-file-type', attrs.class],
      'data-family': fileType.value.family,
      'data-size': props.size,
      'role': props.decorative ? undefined : 'img',
      'aria-hidden': props.decorative ? 'true' : undefined,
      'aria-label': props.decorative ? undefined : props.label || `${fileType.value.description} (${fileType.value.label})`,
    }, [
      h(VIcon, { name: 'file-type', size: iconSize.value }, {
        default: () => h('span', { class: 'varo-file-type__glyph', 'aria-hidden': 'true' }),
      }),
      h('span', { class: 'varo-file-type__label', 'aria-hidden': 'true' }, fileType.value.label),
    ])
  },
})
