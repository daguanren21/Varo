import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { VCalendar, VCalendarCard } from '../src/calendar'
import { VCascader } from '../src/cascader'
import { VDatePicker } from '../src/date-picker'
import { VNumberKeyboard } from '../src/number-keyboard'
import { VPicker } from '../src/picker'
import { VShortPassword } from '../src/short-password'
import { VUploader } from '../src/uploader'

describe('ui-weapp advanced form controls', () => {
  it('confirms picker, cascader, and date selections', async () => {
    const pickerConfirm = vi.fn()
    const cascaderConfirm = vi.fn()
    const dateConfirm = vi.fn()
    const picker = mount(VPicker, {
      props: {
        columns: [
          { label: 'Apple', value: 'apple' },
          { label: 'Pear', value: 'pear' }
        ],
        visible: true,
        onConfirm: pickerConfirm
      }
    })
    const cascader = mount(VCascader, {
      props: {
        options: [{ label: 'Zhejiang', value: 'zhejiang', children: [{ label: 'Hangzhou', value: 'hangzhou' }] }],
        visible: true,
        onConfirm: cascaderConfirm
      }
    })
    const date = mount(VDatePicker, {
      props: {
        month: '2026-05',
        visible: true,
        onConfirm: dateConfirm
      }
    })

    await picker.findAll('.varo-picker__option')[1].trigger('click')
    await picker.get('.varo-picker__confirm').trigger('click')
    await cascader.findAll('.varo-cascader__option')[0].trigger('click')
    await cascader.findAll('.varo-cascader__option')[0].trigger('click')
    await cascader.get('.varo-cascader__confirm').trigger('click')
    await date.find('[data-date="2026-05-20"]').trigger('click')
    await date.get('.varo-date-picker__confirm').trigger('click')

    expect(pickerConfirm).toHaveBeenCalledWith(expect.objectContaining({ value: 'pear' }))
    expect(cascaderConfirm).toHaveBeenCalledWith(expect.objectContaining({ value: ['zhejiang', 'hangzhou'] }))
    expect(dateConfirm).toHaveBeenCalledWith('2026-05-20')
  })

  it('hydrates cascader selections from controlled values', async () => {
    const wrapper = mount(VCascader, {
      props: {
        options: [
          {
            label: 'Zhejiang',
            value: 'zhejiang',
            children: [{ label: 'Hangzhou', value: 'hangzhou' }]
          }
        ],
        value: ['zhejiang', 'hangzhou'],
        visible: true
      }
    })

    expect(wrapper.findAll('.varo-cascader__tab').map((item) => item.text())).toEqual(['Zhejiang', 'Hangzhou'])

    await wrapper.setProps({ value: ['zhejiang'] })

    expect(wrapper.findAll('.varo-cascader__tab').map((item) => item.text())).toEqual(['Zhejiang'])
    expect(wrapper.findAll('.varo-cascader__option').map((item) => item.text())).toEqual(['Hangzhou'])
  })

  it('updates calendar card, number keyboard, password, and uploader', async () => {
    const calendarUpdate = vi.fn()
    const keyboardInput = vi.fn()
    const passwordUpdate = vi.fn()
    const uploadUpdate = vi.fn()
    const card = mount(VCalendarCard, {
      props: {
        month: '2026-05',
        'onUpdate:value': calendarUpdate
      }
    })
    const keyboard = mount(VNumberKeyboard, {
      props: {
        visible: true,
        onInput: keyboardInput
      }
    })
    const password = mount(VShortPassword, {
      props: {
        value: '',
        'onUpdate:value': passwordUpdate
      }
    })
    const uploader = mount(VUploader, {
      props: {
        'onUpdate:value': uploadUpdate
      }
    })

    const fileInput = uploader.get('input').element as HTMLInputElement
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [new File(['file'], 'demo.txt')]
    })

    await card.find('[data-date="2026-05-14"]').trigger('click')
    await keyboard.find('[data-key="8"]').trigger('click')
    await password.get('input').setValue('1234567')
    await uploader.get('input').trigger('change')

    expect(calendarUpdate).toHaveBeenCalledWith('2026-05-14')
    expect(keyboardInput).toHaveBeenCalledWith('8')
    expect(passwordUpdate).toHaveBeenCalledWith('123456')
    expect(uploadUpdate).toHaveBeenCalledWith([expect.objectContaining({ name: 'demo.txt' })])
  })
})
