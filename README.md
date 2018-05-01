# redux-idle-dispatcher
:hourglass: Idle your redux app with ease!

## Why?

Dispatch a custom action after a duration of store idleness in the active browser tab.

The action is debounced so that it's only called once after the duration of idleness. Additionally, the action is only dispatched if the browser tab is active, dispatching immediately on reactivation.

## Installation

`npm install --save redux-idle-dispatcher`

## Usage

```js
const unsubscriber = reduxIdleDispatcher(
  store,    // your redux store
  timeout,  // default is 30000 (ms)
  action    // default is {type: '@@redux-idle-dispatcher/IDLE'}
)
```
