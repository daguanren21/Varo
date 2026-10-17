export interface AgentModelOption {
  id: string
  label: string
  available: boolean
  disabled?: boolean
  reason?: string
}

export function availableModel(models: readonly AgentModelOption[], id: string | undefined): AgentModelOption | undefined {
  return models.find(model => model.id === id && model.available && !model.disabled)
}

export function modelChoices(models: readonly AgentModelOption[], selectedId: string | undefined, excludedId: string | undefined) {
  return models.map(model => ({
    value: model.id,
    label: `${model.label}${model.reason ? ` — ${model.reason}` : ''}`,
    disabled: !model.available || Boolean(model.disabled) || model.id === selectedId || model.id === excludedId,
  }))
}
