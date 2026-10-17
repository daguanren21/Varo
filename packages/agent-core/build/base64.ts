import { fromByteArray, toByteArray } from 'base64-js'

// The parser's bundled entity trie uses canonical, padded base64 at module load.
// This binding is injected locally; importing AI never modifies host globals.
export function decodeBase64(input: string): string {
  let binary = ''
  for (const byte of toByteArray(input)) { binary += String.fromCharCode(byte) }
  return binary
}

// HTML details rendering passes UTF-8 bytes encoded as a binary string.
export function encodeBase64(input: string): string {
  const bytes = new Uint8Array(input.length)
  for (let index = 0; index < input.length; index++) { bytes[index] = input.charCodeAt(index) }
  return fromByteArray(bytes)
}
