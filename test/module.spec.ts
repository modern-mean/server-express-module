import { ExpressModule, ExpressDefaultConfig } from '../src/module';
import * as test from 'blue-tape';
import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as morgan from 'morgan';
import * as sinon from 'sinon';

process.env.EXPRESSMODULE_HTTPS_ENABLE = 1;

test('module.ts constructor default config', (assert) => {
  let moduleTest = new ExpressModule(); 
  assert.notEqual(moduleTest.getExpressApp(), undefined, 'should create an express app');
  assert.notEqual(moduleTest.getHttpServer(), undefined, 'should create http server');
  assert.equal(moduleTest.getMiddleware().length, 3, 'should initialize default middleware');
  assert.end();
});

test('module.ts constructor config module with ModuleConfig argument', (assert) => {
  let config = ExpressDefaultConfig();
  config.options.http.port = '10000';
  let moduleTest = new ExpressModule(config);
  assert.equal(moduleTest.getConfigModule().get('ExpressModule')[0].options.http.port, '10000', 'should override http port');
  assert.end();
});

let moduleTest = new ExpressModule();

test('module.ts enableMiddleware', (assert) => {
  let sandbox = sinon.sandbox.create();
  let useSpy = sandbox.spy(moduleTest.getExpressApp(), 'use');
  return moduleTest
    .enableMiddleware()
    .then(() => {
      assert.equal(useSpy.calledTwice, true, 'should call expressApp.use twice');
      sandbox.restore();
    });
});

test('module.ts listen', (assert) => {
  let sandbox = sinon.sandbox.create();
  let listenHttpSpy = sandbox.spy(moduleTest.getHttpServer(), 'listen');
  let listenHttpsSpy = sandbox.spy(moduleTest.getHttpsServer(), 'listen');
  let config = moduleTest.getConfigModule().get('ExpressModule')[0];
  return moduleTest
    .listen()
    .then(() => {
      assert.equal(listenHttpSpy.calledWith({ port: config.options.http.port, host: config.options.host }, sinon.match.func), true, 'should call httpServer.listen with configuration');
      assert.equal(moduleTest.getHttpServer().listening, true, 'httpServer should be listening');
      assert.equal(listenHttpsSpy.calledWith({ port: config.options.https.port, host: config.options.host }, sinon.match.func), true, 'should call httpsServer.listen with configuration');
      sandbox.restore();
    });
});


test('module.ts destroy', (assert) => {
  let sandbox = sinon.sandbox.create();
  let closeHttpSpy = sandbox.spy(moduleTest.getHttpServer(), 'close');
  let closeHttpsSpy = sandbox.spy(moduleTest.getHttpsServer(), 'close');
  return moduleTest
    .destroy()
    .then(() => {
      assert.equal(closeHttpSpy.called, true, 'should call httpServer.close');
      assert.equal(closeHttpsSpy.called, true, 'should call httpsServer.close');
      sandbox.restore();
    });
});



