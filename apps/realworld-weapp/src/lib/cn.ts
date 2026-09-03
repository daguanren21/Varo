import type { ClassValue } from 'clsx'
import { twMerge } from '@weapp-tailwindcss/merge/slim'
import { clsx } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export type { ClassValue }
