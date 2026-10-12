export interface OnboardingStep { id: string, title: string, description: string, canContinue: boolean }
export interface OnboardingIntent { action: 'back' | 'next' | 'finish' | 'close', stepId: string, position: number }

export function canNavigateOnboarding(steps: OnboardingStep[], position: number, action: OnboardingIntent['action'], blocked = false): boolean {
  if (action === 'close') { return true }
  const step = steps[position]
  if (blocked || !Number.isInteger(position) || !step) { return false }
  if (action === 'back') { return position > 0 }
  if (!step.canContinue) { return false }
  return action === 'next' ? position < steps.length - 1 : position === steps.length - 1
}
