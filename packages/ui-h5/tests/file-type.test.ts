import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { toRaw } from 'vue'
import { AgentAttachmentList } from '../../../apps/playground-h5/src/components/agent-ui/supplemental'
import { classifyFileType, VFileType } from '../src/file-type'

enableAutoUnmount(afterEach)

describe('file type classification', () => {
  it.each([
    ['quarterly.PDF', 'pdf', 'PDF'],
    ['proposal.docx', 'document', 'DOCX'],
    ['forecast.xlsx', 'spreadsheet', 'XLSX'],
    ['slides.pptx', 'presentation', 'PPTX'],
    ['photo.HEIC', 'image', 'HEIC'],
    ['voice.flac', 'audio', 'FLAC'],
    ['recording.webm', 'video', 'WEBM'],
    ['source.tar.gz', 'archive', 'GZ'],
    ['panel.vue', 'code', 'VUE'],
    ['notes.md', 'text', 'MD'],
    ['settings.toml', 'config', 'TOML'],
    ['.env.local', 'config', 'ENV'],
    ['Dockerfile.dev', 'config', 'DOCK'],
    ['.gitignore', 'config', 'GIT'],
    ['LICENSE', 'text', 'LIC'],
    ['LICENCE.md', 'text', 'LIC'],
  ])('classifies %s before conflicting MIME', (filename, family, label) => {
    expect(classifyFileType(filename, 'image/png')).toMatchObject({ family, label, source: 'filename' })
  })

  it.each([
    ['https://files.example/report%2EPDF?download=.png#preview', 'pdf'],
    ['//files.example/assets/PHOTO.JPG?token=secret', 'image'],
    ['C:\\exports\\BUDGET.XLSX', 'spreadsheet'],
    ['/var/config/.env.local?download=1', 'config'],
    ['file:///work/Dockerfile.dev', 'config'],
    ['broken%ZZ.pdf', 'pdf'],
    ['https://report.pdf', 'unknown'],
    ['https://report.pdf?download=notes.docx', 'unknown'],
    ['/directory.pdf/', 'unknown'],
    ['data:text/plain,report.pdf', 'unknown'],
    ['javascript:report.pdf', 'unknown'],
    ['notes.constructor', 'unknown'],
    ['notes.__proto__', 'unknown'],
    ['.unrecognized', 'unknown'],
    ['', 'unknown'],
  ])('safely interprets filename or URL %s', (filename, family) => {
    expect(classifyFileType(filename).family).toBe(family)
  })

  it('uses normalized MIME only when the filename is unrecognized', () => {
    expect(classifyFileType('download', ' Application/PDF; charset=binary ')).toMatchObject({ family: 'pdf', label: 'PDF', extension: '', source: 'mime' })
    expect(classifyFileType('opaque.bin', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toMatchObject({ family: 'spreadsheet', label: 'XLSX' })
    expect(classifyFileType('opaque.bin', 'audio/mpeg')).toMatchObject({ family: 'audio', label: 'AUD' })
    expect(classifyFileType('opaque.bin', 'video/mp4')).toMatchObject({ family: 'video', label: 'VID' })
    expect(classifyFileType('opaque.bin', 'image/avif')).toMatchObject({ family: 'image', label: 'IMG' })
    expect(classifyFileType('opaque.bin', 'application/octet-stream')).toMatchObject({ family: 'unknown', label: 'FILE', source: 'unknown' })
    expect(classifyFileType('opaque.bin', 'image/not a mime')).toMatchObject({ family: 'unknown' })
  })
})

describe('VFileType', () => {
  it('updates the visible type and accessible name with its inputs', async () => {
    const wrapper = mount(VFileType, { props: { filename: 'report.pdf' } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('PDF document (PDF)')
    expect(wrapper.text()).toBe('PDF')
    expect(wrapper.find('.varo-icon').exists()).toBe(true)
    await wrapper.setProps({ filename: 'budget.csv' })
    expect(wrapper.attributes('data-family')).toBe('spreadsheet')
    expect(wrapper.text()).toBe('CSV')
    await wrapper.setProps({ filename: 'download', mimeType: 'image/png', label: '设计参考图' })
    expect(wrapper.attributes('aria-label')).toBe('设计参考图')
    expect(wrapper.text()).toBe('IMG')
  })

  it('hides decorative icons from accessibility and keeps supplied text inert', async () => {
    const wrapper = mount(VFileType, {
      props: { filename: '<img src=x onerror=alert(1)>', label: '<b>Unknown attachment</b>', decorative: true },
      attrs: { 'class': 'consumer-file-type', 'aria-label': 'Should not override decoration' },
    })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.classes()).toContain('consumer-file-type')
    expect(wrapper.text()).toBe('FILE')
    expect(wrapper.findAll('img, b, script')).toHaveLength(0)
    await wrapper.setProps({ decorative: false })
    expect(wrapper.attributes('aria-label')).toBe('<b>Unknown attachment</b>')
    expect(wrapper.findAll('b')).toHaveLength(0)
  })
})

describe('attachment file type integration', () => {
  it('keeps preview precedence, filename text, and original removal payload', async () => {
    const document = { id: 'document', name: 'long-project-specification-with-a-full-filename.pdf', mimeType: 'image/png', size: '42 KB' }
    const preview = { id: 'preview', name: 'preview.png', previewUrl: '/preview.png' }
    const wrapper = mount(AgentAttachmentList, { props: { attachments: [document, preview] } })
    const rows = wrapper.findAll('article')
    expect(rows[0].get('.varo-file-type').attributes('data-family')).toBe('pdf')
    expect(rows[0].get('.varo-file-type').attributes('aria-hidden')).toBe('true')
    expect(rows[0].text()).toContain(document.name)
    expect(rows[1].get('img').attributes('src')).toBe('/preview.png')
    expect(rows[1].find('.varo-file-type').exists()).toBe(false)
    await rows[0].get('button').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([[document]])
    expect(toRaw(wrapper.emitted('remove')![0][0])).toBe(document)
    expect(wrapper.findAll('article')).toHaveLength(2)
    await wrapper.setProps({ attachments: [preview] })
    expect(wrapper.findAll('article')).toHaveLength(1)
    await wrapper.setProps({ attachments: [] })
    expect(wrapper.findAll('article')).toHaveLength(0)
  })
})
