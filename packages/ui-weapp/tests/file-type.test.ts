import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { toRaw } from 'vue'
import AgentAttachmentList from '../../../apps/playground-weapp/src/components/agent-ui/AgentAttachmentList.vue'
import { classifyFileType } from '../native/src/components/ui/file-type-utils'
import VFileType from '../native/src/components/ui/v-file-type.vue'

enableAutoUnmount(afterEach)

describe('native VFileType', () => {
  it('renders special names and updates MIME fallback without fetching a filename', async () => {
    const wrapper = mount(VFileType, { props: { filename: '.env.local' } })
    expect(wrapper.attributes('data-family')).toBe('config')
    expect(wrapper.text()).toBe('ENV')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Configuration file (ENV)')
    await wrapper.setProps({ filename: 'https://files.example/download?name=photo.png', mimeType: 'application/pdf' })
    expect(wrapper.text()).toBe('PDF')
    expect(wrapper.attributes('data-family')).toBe('pdf')
    expect(wrapper.findAll('image')).toHaveLength(0)
    await wrapper.setProps({ filename: 'Dockerfile.dev', mimeType: 'image/png' })
    expect(wrapper.text()).toBe('DOCK')
    expect(wrapper.attributes('data-family')).toBe('config')
  })

  it('has meaningful standalone labels and hides icons next to filenames', async () => {
    const wrapper = mount(VFileType, { props: { filename: 'unknown.custom', className: 'consumer-icon', size: 'sm' } })
    expect(wrapper.classes()).toContain('consumer-icon')
    expect(wrapper.text()).toBe('FILE')
    expect(wrapper.attributes('aria-label')).toBe('Unknown file type (FILE)')
    expect(wrapper.attributes('data-size')).toBe('sm')
    await wrapper.setProps({ label: '未知格式附件' })
    expect(wrapper.attributes('aria-label')).toBe('未知格式附件')
    await wrapper.setProps({ decorative: true })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('classifies native installed helper inputs without browser URL APIs', () => {
    expect(classifyFileType('C:\\files\\REPORT.PDF?download=1', 'image/png')).toMatchObject({ family: 'pdf', source: 'filename' })
    expect(classifyFileType('/app/.gitignore')).toMatchObject({ family: 'config', label: 'GIT' })
    expect(classifyFileType('LICENSE')).toMatchObject({ family: 'text', label: 'LIC' })
    expect(classifyFileType('https://host.pdf')).toMatchObject({ family: 'unknown' })
    expect(classifyFileType('opaque', 'IMAGE/WEBP; charset=binary')).toMatchObject({ family: 'image', source: 'mime' })
  })
})

describe('native attachment file types', () => {
  it('prefers previews and emits the original attachment without mutating the list', async () => {
    const document = { id: 'doc', name: 'design-specification-for-a-long-project-name.pdf', mimeType: 'image/png', size: '42 KB' }
    const preview = { id: 'photo', name: 'photo.png', previewUrl: '/preview.png' }
    const wrapper = mount(AgentAttachmentList, { props: { attachments: [document, preview] } })
    const rows = wrapper.findAll('.agent-attachments > view')
    expect(rows[0].get('.varo-file-type').attributes('data-family')).toBe('pdf')
    expect(rows[0].get('.varo-file-type').attributes('aria-hidden')).toBe('true')
    expect(rows[0].text()).toContain(document.name)
    expect(rows[1].get('image[src="/preview.png"]').attributes('mode')).toBe('aspectFill')
    expect(rows[1].find('.varo-file-type').exists()).toBe(false)
    await rows[0].get('button').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[document]])
    expect(toRaw(wrapper.emitted('remove')![0][0])).toBe(document)
    expect(wrapper.findAll('.agent-attachments > view')).toHaveLength(2)
    await wrapper.setProps({ attachments: [preview] })
    expect(wrapper.findAll('.agent-attachments > view')).toHaveLength(1)
    await wrapper.setProps({ attachments: [] })
    expect(wrapper.findAll('.agent-attachments > view')).toHaveLength(0)
  })
})
