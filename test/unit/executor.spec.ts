import {Browser} from '../../lib/browser'
import {BrowserCollection} from '../../lib/browser_collection'
import {KarmaEventEmitter as EventEmitter} from '../../lib/events'
import {Executor} from '../../lib/executor'
import {expect} from 'chai'
import * as sinon from 'sinon'

describe('executor', () => {
  var emitter
  var capturedBrowsers
  var config
  var spy
  var executor

  beforeEach(() => {
    config = {client: {}}
    emitter = new EventEmitter()
    capturedBrowsers = new BrowserCollection(emitter)
    capturedBrowsers.add(new Browser())
    executor = new Executor(capturedBrowsers, config, emitter)
    executor.socketIoSockets = new EventEmitter()

    spy = {
      onRunStart: () => null,
      onSocketsExecute: () => null
    }

    sinon.spy(spy, 'onRunStart')
    sinon.spy(spy, 'onSocketsExecute')

    emitter.on('run_start', spy.onRunStart)
    executor.socketIoSockets.on('execute', spy.onSocketsExecute)
  })

  it('should start the run and pass client config', () => {
    capturedBrowsers.areAllReady = () => true

    executor.schedule()
    expect(spy.onRunStart).to.have.been.called
    expect(spy.onSocketsExecute).to.have.been.calledWith(config.client)
  })

  it('should wait for all browsers to finish', () => {
    capturedBrowsers.areAllReady = () => false

    // they are not ready yet
    executor.schedule()
    expect(spy.onRunStart).not.to.have.been.called
    expect(spy.onSocketsExecute).not.to.have.been.called

    capturedBrowsers.areAllReady = () => true
    emitter.emit('run_complete')
    expect(spy.onRunStart).to.have.been.called
    expect(spy.onSocketsExecute).to.have.been.called
  })
})
