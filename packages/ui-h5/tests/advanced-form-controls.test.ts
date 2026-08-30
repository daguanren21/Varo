import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { VCalendar, VCalendarCard } from '../src/calendar'
import { VCascader } from '../src/cascader'
import { VDatePicker } from '../src/date-picker'
import { VNumberKeyboard } from '../src/number-keyboard'
import { VPicker } from '../src/picker'
import { VShortPassword } from '../src/short-password'
import { VUploader } from '../src/uploader'

const cityOptions = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      { label: 'Hangzhou', value: 'hangzhou' },
      { label: 'Ningbo', value: 'ningbo' }
    ]
  },
  {
    label: 'Jiangsu',
    value: 'jiangsu',
    children: [{ label: 'Nanjing', value: 'nanjing' }]
  }
]

describe('ui-h5 advanced form controls', () => {
  it('confirms picker selected option', async () => {
    const onConfirm = vi.fn()
    const wrapper = mount(VPicker, {
      props: {
        columns: [
          { label: 'Apple', value: 'apple' },
          { label: 'Pear', value: 'pear' }
        ],
        value: 'apple',
        visible: true,
        onConfirm
      }
    })

    await wrapper.findAll('.varo-picker__option')[1].trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')

    expect(onConfirm).toHaveBeenCalledWith({
      option: { label: 'Pear', value: 'pear' },
      value: 'pear'
    })
  })

  it('walks cascader levels and confirms selected path', async () => {
    const onConfirm = vi.fn()
    const wrapper = mount(VCascader, {
      props: {
        options: cityOptions,
        visible: true,
        onConfirm
      }
    })

    await wrapper.findAll('.varo-cascader__option')[0].trigger('click')
    await wrapper.findAll('.varo-cascader__option')[1].trigger('click')
    await wrapper.get('.varo-cascader__confirm').trigger('click')

    expect(onConfirm).toHaveBeenCalledWith({
      labels: ['Zhejiang', 'Ningbo'],
      options: [cityOptions[0], cityOptions[0].children?.[1]],
      value: ['zhejiang', 'ningbo']
    })
  })

  it('hydrates cascader selections from controlled values', async () => {
    const wrapper = mount(VCascader, {
      props: {
        options: cityOptions,
        value: ['zhejiang', 'hangzhou'],
        visible: true
      }
    })

    expect(wrapper.findAll('.varo-cascader__tab').map((item) => item.text())).toEqual(['Zhejiang', 'Hangzhou'])

    await wrapper.setProps({ value: ['jiangsu'] })

    expect(wrapper.findAll('.varo-cascader__tab').map((item) => item.text())).toEqual(['Jiangsu'])
    expect(wrapper.findAll('.varo-cascader__option').map((item) => item.text())).toEqual(['Nanjing'])
  })

  it('selects calendar card day and popup calendar confirm', async () => {
    const onCardUpdate = vi.fn()
    const onConfirm = vi.fn()
    const card = mount(VCalendarCard, {
      props: {
        month: '2026-05',
        value: '2026-05-14',
        'onUpdate:value': onCardUpdate
      }
    })
    const calendar = mount(VCalendar, {
      props: {
        month: '2026-05',
        value: '2026-05-14',
        visible: true,
        onConfirm
      }
    })

    await card.find('[data-date="2026-05-20"]').trigger('click')
    await calendar.find('[data-date="2026-05-18"]').trigger('click')
    await calendar.get('.varo-calendar__confirm').trigger('click')

    expect(onCardUpdate).toHaveBeenCalledWith('2026-05-20')
    expect(onConfirm).toHaveBeenCalledWith('2026-05-18')
  })

  it('switches calendar card by month and year controls', async () => {
    const onMonthUpdate = vi.fn()
    const wrapper = mount(VCalendarCard, {
      props: {
        month: '2026-05',
        'onUpdate:month': onMonthUpdate
      }
    })

    await wrapper.get('[data-action="next-month"]').trigger('click')

    expect(wrapper.get('.varo-calendar-card__title').text()).toBe('2026-06')
    expect(wrapper.find('[data-date="2026-06-01"]').exists()).toBe(true)
    expect(onMonthUpdate).toHaveBeenLastCalledWith('2026-06')

    await wrapper.get('[data-action="prev-year"]').trigger('click')

    expect(wrapper.get('.varo-calendar-card__title').text()).toBe('2025-06')
    expect(wrapper.find('[data-date="2025-06-01"]').exists()).toBe(true)
    expect(onMonthUpdate).toHaveBeenLastCalledWith('2025-06')
  })

  it('confirms date picker date', async () => {
    const onConfirm = vi.fn()
    const wrapper = mount(VDatePicker, {
      props: {
        value: '2026-05-14',
        visible: true,
        onConfirm
      }
    })

    await wrapper.find('[data-date="2026-05-20"]').trigger('click')
    await wrapper.get('.varo-date-picker__confirm').trigger('click')

    expect(onConfirm).toHaveBeenCalledWith('2026-05-20')
  })

  it('emits number keyboard input, delete, and close actions', async () => {
    const onInput = vi.fn()
    const onDelete = vi.fn()
    const onClose = vi.fn()
    const wrapper = mount(VNumberKeyboard, {
      props: {
        visible: true,
        onClose,
        onDelete,
        onInput
      }
    })

    await wrapper.find('[data-key="1"]').trigger('click')
    await wrapper.get('.varo-number-keyboard__delete').trigger('click')
    await wrapper.get('.varo-number-keyboard__close').trigger('click')

    expect(onInput).toHaveBeenCalledWith('1')
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('updates short password and uploader file list', async () => {
    const passwordUpdate = vi.fn()
    const uploadUpdate = vi.fn()
    const password = mount(VShortPassword, {
      props: {
        length: 4,
        value: '12',
        'onUpdate:value': passwordUpdate
      }
    })
    const uploader = mount(VUploader, {
      props: {
        value: [],
        'onUpdate:value': uploadUpdate
      }
    })

    const fileInput = uploader.get('input').element as HTMLInputElement
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [new File(['hello'], 'hello.txt', { type: 'text/plain' })]
    })

    await password.get('input').setValue('12345')
    await uploader.get('input').trigger('change')

    expect(passwordUpdate).toHaveBeenCalledWith('1234')
    expect(uploadUpdate).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'hello.txt', status: 'done' })
    ])
  })

  it('renders uploader card mode with upload progress', () => {
    const wrapper = mount(VUploader, {
      props: {
        listType: 'card',
        deletable: true,
        uploadText: '上传',
        value: [
          { name: 'avatar.png', progress: 68, status: 'uploading', url: 'https://example.com/avatar.png' },
          { name: 'contract.pdf', progress: 100, status: 'done' }
        ]
      }
    })

    expect(wrapper.attributes('data-list-type')).toBe('card')
    expect(wrapper.find('.varo-uploader__card-preview').exists()).toBe(true)
    expect(wrapper.find('.varo-uploader__card-mask').text()).toContain('avatar.png')
    expect(wrapper.find('.varo-uploader__delete').exists()).toBe(true)
    expect(wrapper.find('.varo-uploader__progress').attributes('aria-valuenow')).toBe('68')
    expect(wrapper.find('.varo-uploader__progress-bar').attributes('style')).toContain('--varo-upload-scale: 0.68')
    expect(wrapper.find('.varo-uploader__trigger-icon').text()).toBe('+')
  })

  it('supports custom uploader item and trigger slots', () => {
    const wrapper = mount(VUploader, {
      props: {
        deletable: true,
        value: [{ name: 'avatar.png', progress: 36, status: 'uploading' }]
      },
      slots: {
        item: ({ file, index, remove }) =>
          h('button', { class: 'custom-upload-item', type: 'button', onClick: () => remove(index) }, `${index}:${file.name}`),
        trigger: ({ uploadText }) => h('span', { class: 'custom-upload-trigger' }, uploadText)
      }
    })

    expect(wrapper.get('.custom-upload-item').text()).toBe('0:avatar.png')
    expect(wrapper.get('.custom-upload-trigger').text()).toBe('Upload')
    expect(wrapper.find('.varo-uploader__item').exists()).toBe(false)
  })

  it('hides uploader delete action when deletable is false', () => {
    const wrapper = mount(VUploader, {
      props: {
        deletable: false,
        listType: 'card',
        value: [{ name: 'avatar.png', status: 'done' }]
      }
    })

    expect(wrapper.find('.varo-uploader__delete').exists()).toBe(false)
  })
})
