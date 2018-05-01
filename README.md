# redux-idle-dispatcher
:hourglass: Idle your redux app with ease!

## Why?

Dispatch a custom action after a duration of store idleness in the active browser tab.

The action is debounced so that it's only called once after the duration of idleness. Additionally, the action is only dispatched if the browser tab is active, dispatching immediately on reactivation.

## Installation

`npm install --save redux-idle-dispatcher`

## Usage

```js
const store = createStore(...) // your redux store
const unsubscriber = reduxIdleDispatcher(store, {
  action: {type: 'IDLE'}, // default is {type: '@@redux-idle-dispatcher/IDLE'}
  timeout: 15000 // default is 30000 (ms)
})
```
