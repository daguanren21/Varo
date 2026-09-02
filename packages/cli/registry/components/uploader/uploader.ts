import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import '../../styles/varo.css'

export interface UploaderFile {
  file?: File
  name: string
  progress?: number
  status?: 'ready' | 'uploading' | 'done' | 'failed'
  url?: string
}

type UploaderListType = 'list' | 'card'

export const VUploader = defineComponent({
  name: 'VUploader',
  props: {
    accept: {
      type: String,
      default: undefined,
    },
    disabled: Boolean,
    deletable: {
      type: Boolean,
      default: true,
    },
    maxCount: {
      type: Number,
      default: Number.POSITIVE_INFINITY,
    },
    multiple: Boolean,
    listType: {
      type: String as PropType<UploaderListType>,
      default: 'list',
    },
    uploadText: {
      type: String,
      default: 'Upload',
    },
    value: {
      type: Array as PropType<UploaderFile[]>,
      default: () => [],
    },
  },
  emits: ['update:value', 'change', 'delete'],
  setup(props, { attrs, emit, slots }) {
    const files = computed(() => props.value ?? [])
    const canUpload = computed(() => !props.disabled && files.value.length < props.maxCount)

    function update(next: UploaderFile[]) {
      emit('update:value', next)
      emit('change', next)
    }

    function onChange(event: Event) {
      const input = event.target as HTMLInputElement
      const selected = Array.from(input.files ?? [])
        .slice(0, Math.max(0, props.maxCount - files.value.length))
        .map<UploaderFile>(file => ({
          file,
          name: file.name,
          status: 'done',
        }))
      update([...files.value, ...selected])
      input.value = ''
    }

    function remove(index: number) {
      const next = files.value.filter((_, current) => current !== index)
      emit('delete', files.value[index])
      update(next)
    }

    function progressOf(file: UploaderFile) {
      const progress = Number(file.progress ?? (file.status === 'done' ? 100 : 0))
      return Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0))
    }

    function renderProgress(file: UploaderFile) {
      if (file.status !== 'uploading') { return null }

      const progress = progressOf(file)

      return h(
        'div',
        {
          'class': 'varo-uploader__progress',
          'aria-label': `${file.name} upload progress`,
          'aria-valuemax': 100,
          'aria-valuemin': 0,
          'aria-valuenow': progress,
          'role': 'progressbar',
        },
        [
          h('span', {
            class: 'varo-uploader__progress-bar',
            style: { width: `${progress}%` },
          }),
        ],
      )
    }

    function statusText(file: UploaderFile) {
      return file.status === 'uploading'
        ? `${progressOf(file)}%`
        : file.status === 'failed'
          ? '失败'
          : ''
    }

    function renderStatus(file: UploaderFile) {
      const text = statusText(file)
      return text ? h('span', { class: 'varo-uploader__status' }, text) : null
    }

    function renderDelete(index: number) {
      if (!props.deletable) { return null }

      return h('button', {
        'class': 'varo-uploader__delete',
        'type': 'button',
        'aria-label': 'Delete file',
        'onClick': () => remove(index),
      }, '×')
    }

    function itemSlotProps(file: UploaderFile, index: number) {
      return {
        file,
        index,
        progress: progressOf(file),
        remove,
      }
    }

    function triggerSlotProps() {
      return {
        disabled: props.disabled,
        uploadText: props.uploadText,
      }
    }

    function renderFileIcon() {
      return h('span', { 'class': 'varo-uploader__file-icon', 'aria-hidden': 'true' }, [
        h('svg', {
          'fill': 'none',
          'stroke': 'currentColor',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': 1.7,
          'viewBox': '0 0 24 24',
        }, [
          h('path', { d: 'M7 3.5h7l4 4v13H7z' }),
          h('path', { d: 'M14 3.5v4h4' }),
          h('path', { d: 'M10 12h5M10 15.5h5' }),
        ]),
      ])
    }

    function renderCardMask(file: UploaderFile) {
      const text
        = file.status === 'uploading'
          ? `${file.name} · ${progressOf(file)}%`
          : file.status === 'failed'
            ? `${file.name} · 失败`
            : file.name

      return h('div', { class: 'varo-uploader__card-mask' }, [
        h('span', { class: 'varo-uploader__card-name' }, text),
      ])
    }

    function renderFile(file: UploaderFile, index: number) {
      const customItem = slots.item?.(itemSlotProps(file, index))
      if (customItem?.length) { return customItem }

      if (props.listType === 'card') {
        return h('div', { 'class': 'varo-uploader__item', 'data-status': file.status }, [
          h(
            'div',
            {
              class: 'varo-uploader__card-preview',
              style: file.url ? { backgroundImage: `url("${file.url}")` } : undefined,
            },
            file.url ? [] : [renderFileIcon()],
          ),
          renderCardMask(file),
          renderProgress(file),
          renderDelete(index),
        ])
      }

      return h('div', { 'class': 'varo-uploader__item', 'data-status': file.status }, [
        renderFileIcon(),
        h('div', { class: 'varo-uploader__meta' }, [
          h('span', { class: 'varo-uploader__name' }, file.name),
          renderProgress(file),
        ]),
        renderStatus(file),
        renderDelete(index),
      ])
    }

    function renderTrigger() {
      if (!canUpload.value) { return null }

      const customTrigger = slots.trigger?.(triggerSlotProps())

      return h('label', { class: 'varo-uploader__trigger' }, [
        customTrigger?.length
          ? customTrigger
          : [
              h('span', { 'class': 'varo-uploader__trigger-icon', 'aria-hidden': 'true' }, '+'),
              h('span', { class: 'varo-uploader__trigger-text' }, props.uploadText),
            ],
        h('input', {
          accept: props.accept,
          class: 'varo-uploader__input',
          disabled: props.disabled,
          multiple: props.multiple,
          type: 'file',
          onChange,
        }),
      ])
    }

    return () =>
      h('div', { ...attrs, 'class': ['varo-uploader', attrs.class], 'data-disabled': String(props.disabled), 'data-list-type': props.listType }, [
        h(
          'div',
          { class: 'varo-uploader__list' },
          files.value.map((file, index) => renderFile(file, index)),
        ),
        renderTrigger(),
      ])
  },
})
