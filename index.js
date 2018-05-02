/* global requestIdleCallback, cancelIdleCallback, requestAnimationFrame */

const requestIdleCallbackFallback = cb =>
  setTimeout(() => {
    const start = Date.now()
    cb({
      didTimeout: false,
      timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start))
      }
    })
  })

const requestIdleCallbackIsSupported =
  typeof requestIdleCallback !== 'undefined'
const requestIdleCallback = requestIdleCallbackIsSupported
  ? requestIdleCallback
  : requestIdleCallbackFallback

const debounce = (callback, time) => {
  let interval
  return (...args) => {
    clearTimeout(interval)
    interval = setTimeout(() => {
      interval = null
      callback(...args)
    }, time)
  }
}

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

  const debouncedIdleDispatcher = debounce(() => {
    requestAnimationFrame(() => {
      requestIdleCallback(idleDispatcher)
    })
  }, timeout)

  const unsubscriber = store.subscribe(debouncedIdleDispatcher)
  debouncedIdleDispatcher()

  return (...args) => {
    unsubscribed = true
    unsubscriber(...args)
  }
}
