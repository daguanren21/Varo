import type { ClassValue } from 'clsx'
import { twMerge as fullTwMerge } from '@weapp-tailwindcss/merge'
import { clsx } from 'clsx'
import { describe, expect, it } from 'vitest'
import { cn } from '../src/lib/cn'

const cases: ClassValue[][] = [
  ['p-2', 'p-4'],
  ['flex items-start', 'grid items-center'],
  ['w-10', 'w-[32rpx]'],
  ['text-sm font-normal', 'text-lg font-semibold'],
  ['bg-red-500 text-white', 'bg-blue-500'],
  ['rounded-sm border', 'rounded-xl border-2'],
  ['hover:bg-red-500', 'hover:bg-blue-500'],
  ['md:px-2', 'md:px-6'],
  ['fixed left-2 top-2', { 'right-4': true, 'opacity-50': false }],
  [['flex', null, false], 'gap-2', 'gap-4'],
]

describe('cn', () => {
  it.each(cases)('matches the full mini-program merge contract for %#', (...inputs) => {
    expect(cn(...inputs)).toBe(fullTwMerge(clsx(inputs)))
  })
})
