import type { Store, Action, Unsubscribe } from 'redux';

import { createStore } from 'redux';

import reduxIdleDispatcher from './';

const { IDLE } = reduxIdleDispatcher;

describe('reduxIdleDispatcher', () => {
  let store: Store, unsubscriber: Unsubscribe;

  beforeEach(() => {
    store = createStore(() => ({}));
    jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    if (unsubscriber) {
      unsubscriber();
    }
  });

  it('dispatches a debounced idle action', () => {
    unsubscriber = reduxIdleDispatcher(store, 100);
    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: IDLE
        })
      );
    }, 150);
  });

  it('can dispatch a custom action', () => {
    const action: Action = { type: 'FOO_IDLE' };
    unsubscriber = reduxIdleDispatcher(store, 100, action);
    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FOO_IDLE'
        })
      );
    }, 150);
  });

  it('can debounce on a custom timeout', () => {
    unsubscriber = reduxIdleDispatcher(store, 400);
    setTimeout(() => {
      expect(store.dispatch).not.toHaveBeenCalled();
    }, 300);
    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: IDLE
        })
      );
    }, 500);
  });

  it('provides a handle to unsubscribe', () => {
    unsubscriber = reduxIdleDispatcher(store, 100);
    setTimeout(() => {
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(unsubscriber).toBeInstanceOf(Function);

      unsubscriber();
      unsubscriber = null;

      setTimeout(() => {
        expect(store.dispatch).toHaveBeenCalledTimes(1);
      }, 200);
    }, 150);
  });

  it('provides an "IDLE" constant', () => {
    expect(IDLE).toEqual('@@redux-idle-dispatcher/IDLE');
  });
});
