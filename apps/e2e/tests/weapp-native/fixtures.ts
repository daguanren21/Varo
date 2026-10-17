import type { MiniProgramFixture } from '../../engines/wechat'
import { test as base, expect } from 'e2e'

export const test = base.extend<{ miniProgram: MiniProgramFixture }>()
export const nativePlatforms = ['weapp-headless', 'weapp-devtools']
export const blockEntries = [
  'login-form',
  'profile-card',
  'profile-edit',
  'product-list',
  'order-filter',
  'agent-chat',
  'retail-home',
  'retail-category',
  'retail-cart',
  'retail-product-detail',
  'retail-checkout',
  'retail-order-list',
  'retail-profile',
] as const

export function classXPath(name: string): string {
  return `//*[contains(concat(" ", normalize-space(@class), " "), " ${name} ")]`
}
export function dataRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new Error('Expected native page object data') }
  return value as Record<string, unknown>
}
export function dataArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) { throw new TypeError('Expected native page array data') }
  return value.map(dataRecord)
}
export async function expectRoute(miniProgram: MiniProgramFixture, route: string): Promise<void> {
  await expect.poll(() => miniProgram.route()).toBe(route.replace(/^\/+/, ''))
}
export async function expectToast(miniProgram: MiniProgramFixture, xpath: string, title: string): Promise<void> {
  const before = (await miniProgram.toasts()).length
  await miniProgram.locator(xpath).tap()
  await expect.poll(async () => (await miniProgram.toasts()).slice(before)).toEqual([title])
}
export async function touchTarget(miniProgram: MiniProgramFixture, xpath: string): Promise<void> {
  const { width, height } = await miniProgram.geometry(xpath)
  expect(width).toBeGreaterThanOrEqual(44)
  expect(height).toBeGreaterThanOrEqual(44)
}
export async function showBlock(miniProgram: MiniProgramFixture, block: string): Promise<void> {
  await miniProgram.reLaunch(`/retail-showcase/index/index?block=${encodeURIComponent(block)}&capture=1`)
  await expectRoute(miniProgram, 'retail-showcase/index/index')
  await expect.poll(() => miniProgram.data('active')).toBe(block)
}
