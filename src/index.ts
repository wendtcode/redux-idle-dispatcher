import type { Store, Action, Unsubscribe } from 'redux';

type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

declare global {
  interface Window {
    requestIdleCallback?: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions
    ) => RequestIdleCallbackHandle;
  }
}

interface ReduxIdleDispatcher {
  (store: Store, timeout?: number, action?: Action): () => void;
  IDLE: string;
}

const requestIdleCallbackFallback = (
  callback: (deadline: RequestIdleCallbackDeadline) => void
) =>
  setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining() {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  });

const requestIdleCallbackIsSupported =
  typeof window.requestIdleCallback !== 'undefined';

const requestIdleCallback = requestIdleCallbackIsSupported
  ? window.requestIdleCallback
  : requestIdleCallbackFallback;

const debounce = (callback: () => void, time: number) => {
  let interval: number;
  return () => {
    window.clearTimeout(interval);
    interval = window.setTimeout(() => {
      interval = null;
      callback();
    }, time);
  };
};

const IDLE = '@@redux-idle-dispatcher/IDLE';

Object.defineProperty(reduxIdleDispatcher, 'IDLE', {
  get() {
    return IDLE;
  }
});

export default reduxIdleDispatcher as ReduxIdleDispatcher;

function reduxIdleDispatcher(
  store: Store,
  timeout: number = 30000,
  action: Action = { type: IDLE }
) {
  let unsubscribed = false;
  const idleDispatcher = () => {
    if (!unsubscribed) {
      store.dispatch(action);
    }
  };

  const debouncedIdleDispatcher = debounce(() => {
    window.requestAnimationFrame(() => {
      requestIdleCallback(idleDispatcher);
    });
  }, timeout);

  const unsubscriber: Unsubscribe = store.subscribe(debouncedIdleDispatcher);
  debouncedIdleDispatcher();

  return () => {
    unsubscribed = true;
    unsubscriber();
  };
}
