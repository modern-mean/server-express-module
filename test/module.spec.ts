import { ExpressModule, ExpressDefaultConfig, Middleware, ExpressLoggerConfig } from '../src/module';
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

test('module.ts addMiddleware', (assert) => {
  let middleware: Middleware = {
    enable: true,
    name: 'testmiddleware',
    priority: 10,
    middleware: (req, res) => {}
  };

  let middleware2: Middleware = {
    enable: true,
    name: 'testmiddleware2',
    priority: 10,
    middleware: (req, res) => {}
  };

  let middleware3: Middleware = {
    enable: true,
    name: 'testmiddleware2',
    priority: 10,
    middleware: (req, res) => {}
  };

  let clen = moduleTest.getMiddleware().length;
  
  return moduleTest
    .addMiddleware(middleware)
    .then(() => moduleTest.addMiddleware(middleware2))
    .then(() => moduleTest.addMiddleware(middleware3))
    .then(() => {
      assert.equal(moduleTest.getMiddleware().length, clen + 2, 'add middleware to the stack');
      assert.equal(moduleTest.getMiddleware('testmiddleware').length, 1, 'middleware should exist on stack');
    });
});

test('module.ts enableMiddleware success', (assert) => {
  let sandbox = sinon.sandbox.create();
  let useStub = sandbox.stub(moduleTest.getExpressApp(), 'use');
  let middleware = moduleTest.getMiddleware();
  middleware[0].priority = 20;
  middleware[1].priority = 1;
  middleware[2].priority = 3;
  let disableSpy = sandbox.spy(middleware[2], 'middleware');
  middleware[3].priority = 3;
  middleware[4].priority = 3;
  return moduleTest
    .enableMiddleware()
    .then(() => {
      assert.equal(disableSpy.called, false, 'should not call middleware[2]');
      assert.equal(useStub.args[0][0], middleware[1].middleware, 'should middleware[1] first');
      assert.equal(useStub.args[1][0], middleware[3].middleware, 'should middleware[3] second');
      assert.equal(useStub.args[2][0], middleware[4].middleware, 'should middleware[4] third');
      assert.equal(useStub.args[3][0], middleware[0].middleware, 'should middleware[0] fourth');
      sandbox.restore();
    });
});

test('module.ts enableMiddleware error', (assert) => {
  let sandbox = sinon.sandbox.create();
  let useStub = sandbox.stub(moduleTest.getExpressApp(), 'use').throws('Error!!!');
  return moduleTest
    .enableMiddleware()
    .catch(err => {
      assert.equal(err.name, 'Error!!!', 'should reject with error');
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

test('module.ts ExpressDefaultConfig', (assert) => {
  let config = ExpressDefaultConfig();
  assert.equal(config.module, 'ExpressModule', 'should return default config');
  assert.end();
});

test('module.ts ExpressDefaultConfig environment variables', (assert) => {
  delete process.env.EXPRESSMODULE_HTTPS_ENABLE;
  process.env.EXPRESSMODULE_HOST = '0.0.0.1';
  process.env.EXPRESSMODULE_HTTP_PORT = '6000';
  process.env.EXPRESSMODULE_HTTPS_PORT = '6001',
  process.env.EXPRESSMODULE_HTTPS_KEY = '/ssl/keytest.pem';
  process.env.EXPRESSMODULE_HTTPS_CERT = '/ssl/certtest.pem';
  
  let config = ExpressDefaultConfig();
  assert.equal(config.options.host, process.env.EXPRESSMODULE_HOST, 'should change hostname');
  assert.equal(config.options.http.port, process.env.EXPRESSMODULE_HTTP_PORT, 'should change http port');
  assert.equal(config.options.https.port, process.env.EXPRESSMODULE_HTTPS_PORT, 'should change https port');
  assert.equal(config.options.https.options.key, process.env.EXPRESSMODULE_HTTPS_KEY, 'should change https key');
  assert.equal(config.options.https.options.cert, process.env.EXPRESSMODULE_HTTPS_CERT, 'should change https cert');
  assert.end();
});

test('module.ts ExpressLoggerConfig environment variables', (assert) => {
  process.env.EXPRESSMODULE_LOG_LEVEL = 'silly';
  process.env.EXPRESSMODULE_LOG_FILE = 'test.log';
  process.env.EXPRESSMODULE_LOG_CONSOLE = 1;
  
  let config = ExpressLoggerConfig();
  assert.equal(config.options.level, process.env.EXPRESSMODULE_LOG_LEVEL, 'should change log level');
  assert.equal(config.options.file, process.env.EXPRESSMODULE_LOG_FILE, 'should change log file');
  assert.equal(config.options.console, false, 'should change log console');
  assert.end();
});