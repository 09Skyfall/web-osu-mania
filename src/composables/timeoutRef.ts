import { debounce } from 'lodash'
import { customRef } from 'vue'

export function timeoutRef<T>(value: T | undefined, timeout: number) {
  const clear = debounce((trigger: () => void) => { value = undefined; trigger() }, timeout)

  const ref = customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        value = newValue
        clear(trigger)
        trigger()
      }
    }
  })

  ref.value = value
  return ref
}