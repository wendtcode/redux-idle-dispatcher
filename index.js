import raf from 'raf'
import ric, {cancelIdleCallback} from 'ric-shim'
import debouce from 'just-debounce'

export const IDLE = '@@redux-idle-dispatcher/IDLE'

Object.defineProperty(reduxIdleDispatcher, 'IDLE', {
  get() {
    return IDLE
  }
})

export default reduxIdleDispatcher

function reduxIdleDispatcher(store, timeout = 30000, action = {type: IDLE}) {
  if (
    typeof store !== 'object' ||
    typeof store.dispatch !== 'function' ||
    typeof store.subscribe !== 'function'
  ) {
    throw new Error('Invalid `store` argument; Expected a redux store')
  }

  if (timeout && typeof timeout !== 'number') {
    throw new Error('Invalid `timeout` argument; Expected a number of ms')
  }

  if (
    action &&
    (typeof action !== 'object' || typeof action.type !== 'string')
  ) {
    throw new Error('Invalid `action` argument; Expected a valid redux action')
  }

  let unsubscribed = false
  const idleDispatcher = () => {
    if (!unsubscribed) {
      store.dispatch(action)
    }
  }

  const debouncedIdleDispatcher = debouce(() => {
    const rafHandle = raf(() => {
      const ricHandle = ric(idleDispatcher)
    })
  }, timeout)

  const unsubscriber = store.subscribe(debouncedIdleDispatcher)

  return (...args) => {
    unsubscribed = true
    unsubscriber(...args)
  }
}
