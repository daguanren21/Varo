// Generated from registry/components/time-field/time-field-utils.ts; edit the Registry source.
export interface TimeFieldConstraints {
  min: number
  max: number
  minuteStep: number
}

export interface TimeFieldOption {
  label: string
  value: number
  disabled: boolean
}

export function parseTimeFieldValue(value: string | null | undefined): [number, number] | undefined {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return undefined
  }
  return [Number(value.slice(0, 2)), Number(value.slice(3, 5))]
}

export function timeFieldValue(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length !== 2) {
    return undefined
  }
  const [hour, minute] = value
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return undefined
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function timeFieldConstraints(min?: string | null, max?: string | null, minuteStep = 1): TimeFieldConstraints {
  if (!Number.isInteger(minuteStep) || minuteStep < 1 || minuteStep > 59) {
    throw new RangeError('VTimeField minuteStep must be an integer from 1 to 59')
  }
  const minimum = min == null ? [0, 0] : parseTimeFieldValue(min)
  const maximum = max == null ? [23, 59] : parseTimeFieldValue(max)
  if (!minimum || !maximum) {
    throw new RangeError('VTimeField min and max must use HH:mm')
  }
  return { min: minimum[0] * 60 + minimum[1], max: maximum[0] * 60 + maximum[1], minuteStep }
}

function isAvailable(hour: number, minute: number, constraints: TimeFieldConstraints): boolean {
  const value = hour * 60 + minute
  return minute % constraints.minuteStep === 0 && (constraints.min <= constraints.max
    ? value >= constraints.min && value <= constraints.max
    : value >= constraints.min || value <= constraints.max)
}

export function isTimeFieldValueValid(value: string | null | undefined, constraints: TimeFieldConstraints): boolean {
  const parts = parseTimeFieldValue(value)
  return parts !== undefined && isAvailable(parts[0], parts[1], constraints)
}

function firstMinute(hour: number, constraints: TimeFieldConstraints): number | undefined {
  for (let minute = 0; minute < 60; minute += constraints.minuteStep) {
    if (isAvailable(hour, minute, constraints)) {
      return minute
    }
  }
  return undefined
}

/** Resolve only the picker draft; callers keep the externally supplied display value. */
export function resolveTimeFieldDraft(value: string | null | undefined, constraints: TimeFieldConstraints): string | undefined {
  const parts = parseTimeFieldValue(value)
  if (parts && value != null) {
    if (isAvailable(parts[0], parts[1], constraints)) {
      return value
    }
    const minute = firstMinute(parts[0], constraints)
    if (minute !== undefined) {
      return timeFieldValue([parts[0], minute])
    }
  }
  for (let hour = 0; hour < 24; hour++) {
    const minute = firstMinute(hour, constraints)
    if (minute !== undefined) {
      return timeFieldValue([hour, minute])
    }
  }
  return undefined
}

export function buildTimeFieldColumns(value: string | undefined, constraints: TimeFieldConstraints, inactive = false): TimeFieldOption[][] {
  const hour = parseTimeFieldValue(value)?.[0]
  const hours = Array.from({ length: 24 }, (_, index) => ({
    label: String(index).padStart(2, '0'),
    value: index,
    disabled: inactive || firstMinute(index, constraints) === undefined,
  }))
  const minutes: TimeFieldOption[] = []
  for (let minute = 0; minute < 60; minute += constraints.minuteStep) {
    minutes.push({
      label: String(minute).padStart(2, '0'),
      value: minute,
      disabled: inactive || hour === undefined || !isAvailable(hour, minute, constraints),
    })
  }
  return [hours, minutes]
}
