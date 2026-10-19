// Generated from registry/components/file-type/file-type-utils.ts; edit the Registry source.
export type FileTypeFamily = 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'audio' | 'video' | 'archive' | 'code' | 'text' | 'config' | 'unknown'
export type FileTypeSize = 'sm' | 'md' | 'lg'

export interface FileTypeInfo {
  readonly family: FileTypeFamily
  /** Recognized lowercase extension; empty for special names, MIME fallback and unknown files. */
  readonly extension: string
  readonly label: string
  readonly description: string
  readonly source: 'filename' | 'mime' | 'unknown'
}

const extensions: Readonly<Record<string, FileTypeFamily>> = {
  'pdf': 'pdf',
  'doc': 'document',
  'docx': 'document',
  'odt': 'document',
  'rtf': 'document',
  'xls': 'spreadsheet',
  'xlsx': 'spreadsheet',
  'ods': 'spreadsheet',
  'csv': 'spreadsheet',
  'tsv': 'spreadsheet',
  'ppt': 'presentation',
  'pptx': 'presentation',
  'odp': 'presentation',
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'webp': 'image',
  'avif': 'image',
  'svg': 'image',
  'bmp': 'image',
  'ico': 'image',
  'tif': 'image',
  'tiff': 'image',
  'heic': 'image',
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  'flac': 'audio',
  'aac': 'audio',
  'm4a': 'audio',
  'opus': 'audio',
  'mp4': 'video',
  'webm': 'video',
  'mov': 'video',
  'avi': 'video',
  'mkv': 'video',
  'm4v': 'video',
  'zip': 'archive',
  'rar': 'archive',
  '7z': 'archive',
  'tar': 'archive',
  'gz': 'archive',
  'bz2': 'archive',
  'xz': 'archive',
  'tgz': 'archive',
  'js': 'code',
  'jsx': 'code',
  'ts': 'code',
  'tsx': 'code',
  'mjs': 'code',
  'cjs': 'code',
  'vue': 'code',
  'html': 'code',
  'css': 'code',
  'scss': 'code',
  'py': 'code',
  'rb': 'code',
  'go': 'code',
  'rs': 'code',
  'java': 'code',
  'c': 'code',
  'h': 'code',
  'cpp': 'code',
  'cs': 'code',
  'php': 'code',
  'sh': 'code',
  'sql': 'code',
  'swift': 'code',
  'kt': 'code',
  'txt': 'text',
  'md': 'text',
  'mdx': 'text',
  'log': 'text',
  'json': 'config',
  'jsonc': 'config',
  'yaml': 'config',
  'yml': 'config',
  'toml': 'config',
  'ini': 'config',
  'xml': 'config',
  'env': 'config',
}

const familyDescriptions: Record<FileTypeFamily, string> = {
  pdf: 'PDF document',
  document: 'Document',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
  archive: 'Archive',
  code: 'Source code',
  text: 'Text document',
  config: 'Configuration file',
  unknown: 'Unknown file type',
}

const mimeExtensions: Readonly<Record<string, string>> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/rtf': 'rtf',
  'text/rtf': 'rtf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'text/csv': 'csv',
  'text/tab-separated-values': 'tsv',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/vnd.rar': 'rar',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'application/x-tar': 'tar',
  'application/gzip': 'gz',
  'application/x-bzip2': 'bz2',
  'application/x-xz': 'xz',
  'application/javascript': 'js',
  'text/javascript': 'js',
  'text/html': 'html',
  'text/css': 'css',
  'text/x-python': 'py',
  'application/x-sh': 'sh',
  'application/sql': 'sql',
  'application/json': 'json',
  'application/ld+json': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/yaml': 'yaml',
  'text/yaml': 'yaml',
  'application/toml': 'toml',
  'text/plain': 'txt',
  'text/markdown': 'md',
}

function basename(filename: string): string {
  let path = filename.trim().replace(/\\/g, '/')
  // A URL authority is not a filename. Never interpret an opaque URI as a path.
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path)) {
    path = path.replace(/^(?:[a-z][a-z\d+.-]*:)?\/\/[^/?#]*/i, '')
  }
  else if (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^[a-z]:\//i.test(path)) {
    return ''
  }
  path = path.split(/[?#]/, 1)[0]
  let name = path.slice(path.lastIndexOf('/') + 1)
  try {
    name = decodeURIComponent(name)
  }
  catch {
    // A malformed percent escape is a literal filename, not a rendering error.
  }
  name = name.replace(/\\/g, '/')
  return name.slice(name.lastIndexOf('/') + 1).toLowerCase()
}

function info(family: FileTypeFamily, label: string, source: FileTypeInfo['source'], extension = ''): FileTypeInfo {
  return { family, extension, label, description: familyDescriptions[family], source }
}

/** Presentation only: does not inspect contents, fetch URLs, or decide upload admission. */
export function classifyFileType(filename = '', mimeType = ''): FileTypeInfo {
  const name = basename(filename)
  if (/^\.env(?:\..+)?$/.test(name)) { return info('config', 'ENV', 'filename') }
  if (/^dockerfile(?:\..+)?$/.test(name)) { return info('config', 'DOCK', 'filename') }
  if (name === '.gitignore' || name === '.gitattributes') { return info('config', 'GIT', 'filename') }
  if (/^licen[cs]e(?:\.(?:txt|md))?$/.test(name)) { return info('text', 'LIC', 'filename') }

  const dot = name.lastIndexOf('.')
  const extension = dot > 0 ? name.slice(dot + 1) : ''
  if (Object.hasOwn(extensions, extension)) {
    return info(extensions[extension], extension.toUpperCase(), 'filename', extension)
  }

  const mime = mimeType.split(';', 1)[0].trim().toLowerCase()
  if (Object.hasOwn(mimeExtensions, mime)) {
    const matched = mimeExtensions[mime]
    return info(extensions[matched], matched.toUpperCase(), 'mime')
  }
  if (/^image\/[a-z\d][a-z\d!#$&^_.+-]*$/.test(mime)) { return info('image', 'IMG', 'mime') }
  if (/^audio\/[a-z\d][a-z\d!#$&^_.+-]*$/.test(mime)) { return info('audio', 'AUD', 'mime') }
  if (/^video\/[a-z\d][a-z\d!#$&^_.+-]*$/.test(mime)) { return info('video', 'VID', 'mime') }
  return info('unknown', 'FILE', 'unknown')
}
