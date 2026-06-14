type Listener = (data: any) => void
const listeners = new Map<string, Set<Listener>>()

export const eventBus = {
  on(event: string, fn: Listener) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(fn)
  },
  off(event: string, fn: Listener) {
    listeners.get(event)?.delete(fn)
  },
  emit(event: string, data: any) {
    listeners.get(event)?.forEach(fn => fn(data))
  },
}
