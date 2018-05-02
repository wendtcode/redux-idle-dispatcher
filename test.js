// global describe, beforeEach, afterEach, it

require('raf/polyfill')

const chai = require('chai')
const {expect} = chai
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {createStore} = require('redux')

const reduxIdleDispatcher = require('.')
const {IDLE} = reduxIdleDispatcher

chai.should()
chai.use(sinonChai)

describe('reduxIdleDispatcher', () => {
  let store, unsubscriber

  beforeEach(() => {
    store = createStore(() => ({}))
    sinon.spy(store, 'dispatch')
  })

  afterEach(() => {
    if (unsubscriber) {
      unsubscriber()
    }
  })

  it('throws when called without a store', () => {
    expect(() => {
      reduxIdleDispatcher()
    }).to.throw('Invalid `store` argument; Expected a redux store')
  })

  it('throws when called with a store missing "dispatch()"', () => {
    expect(() => {
      reduxIdleDispatcher({subscribe() {}})
    }).to.throw('Invalid `store` argument; Expected a redux store')
  })

  it('throws when called with a store missing "subscribe()"', () => {
    expect(() => {
      reduxIdleDispatcher({dispatch() {}})
    }).to.throw('Invalid `store` argument; Expected a redux store')
  })

  it('does not throw when called with a valid store', () => {
    expect(() => {
      unsubscriber = reduxIdleDispatcher(store)
    }).not.to.throw()
  })

  it('dispatches a debounced idle action', done => {
    unsubscriber = reduxIdleDispatcher(store, 100)
    setTimeout(() => {
      expect(store.dispatch).to.have.been.calledWith(
        sinon.match.has('type', IDLE)
      )
      done()
    }, 150)
  })

  it('can dispatch a custom action', done => {
    unsubscriber = reduxIdleDispatcher(store, 100, {type: 'FOO_IDLE'})
    setTimeout(() => {
      expect(store.dispatch).to.have.been.calledWith(
        sinon.match.has('type', 'FOO_IDLE')
      )
      done()
    }, 150)
  })

  it('can debounce on a custom timeout', done => {
    unsubscriber = reduxIdleDispatcher(store, 400)
    setTimeout(() => {
      expect(store.dispatch).not.to.have.been.calledWith(
        sinon.match.has('type', IDLE)
      )
    }, 300)
    setTimeout(() => {
      expect(store.dispatch).to.have.been.calledWith(
        sinon.match.has('type', IDLE)
      )
      done()
    }, 500)
  })

  it('provides a handle to unsubscribe', done => {
    unsubscriber = reduxIdleDispatcher(store, 100)
    setTimeout(() => {
      expect(store.dispatch.callCount, '[pre-unsubscribe]').to.equal(1)
      expect(unsubscriber).to.be.a('function')

      unsubscriber()
      unsubscriber = null // so afterEach doesn't try it again

      setTimeout(() => {
        expect(store.dispatch.callCount, '[post-unsubscribe]').to.equal(1)
        done()
      }, 200)
    }, 150)
  })

  it('provides an "IDLE" constant', () => {
    expect(IDLE).to.equal('@@redux-idle-dispatcher/IDLE')
  })
})
