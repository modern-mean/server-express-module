import * as test from 'blue-tape';
import * as http from 'http';
import * as https from 'https';
import * as sinon from 'sinon';
import { ServerModule, ServerDefaultConfig } from '../src/server';
import { createConfig } from '@modern-mean/server-base-module';

process.env.SERVERMODULE_HTTPS_ENABLE = 1;

test('server.ts constructor default config', (assert) => {
  let moduleTest = new ServerModule();
  assert.notEqual(moduleTest.getHttpServer(), undefined, 'should create http server');
  assert.notEqual(moduleTest.getHttpsServer(), undefined, 'should create https server');
  assert.end();
});

test('server.ts constructor config module with ModuleConfig argument', (assert) => {
  let config = ServerDefaultConfig();
  config.options.http.port = '10002';
  let moduleTest = new ServerModule(config);
  assert.equal(moduleTest.getConfigModule().get('ServerModule')[0].options.http.port, '10002', 'should override http port');
  assert.end();
});

let moduleTest = new ServerModule();


test('server.ts listen', (assert) => {
  let sandbox = sinon.sandbox.create();
  let listenHttpSpy = sandbox.spy(moduleTest.getHttpServer(), 'listen');
  let listenHttpsSpy = sandbox.spy(moduleTest.getHttpsServer(), 'listen');
  let config = moduleTest.getConfigModule().get('ServerModule')[0];
  return moduleTest
    .listen()
    .then(() => {
      assert.equal(listenHttpSpy.calledWith({ port: config.options.http.port, host: config.options.host }, sinon.match.func), true, 'should call httpServer.listen with configuration');
      assert.equal(moduleTest.getHttpServer().listening, true, 'httpServer should be listening');
      assert.equal(listenHttpsSpy.calledWith({ port: config.options.https.port, host: config.options.host }, sinon.match.func), true, 'should call httpsServer.listen with configuration');
      sandbox.restore();
    })
    .then(() => moduleTest.destroy());
});

test('server.ts listen no https', (assert) => {
  let config = moduleTest.getConfigModule().get('ServerModule')[0];
  config.options.https.enable = false;
  let sandbox = sinon.sandbox.create();
  let listenHttpSpy = sandbox.spy(moduleTest.getHttpServer(), 'listen');
  let listenHttpsSpy = sandbox.spy(moduleTest.getHttpsServer(), 'listen');
  return moduleTest
    .listen()
    .then(() => {
      assert.equal(listenHttpsSpy.called, false, 'should not call httpsServer.listen');
      config.options.https.enable = true;
      sandbox.restore();
    })
    .then(() => moduleTest.destroy());
});

test('server.ts listen() error', (assert) => {
  let sandbox = sinon.sandbox.create();
  let listenHttpStub = sandbox.stub(moduleTest.getHttpServer(), 'listen').throws('Error!!!');
  let listenHttpsStub = sandbox.stub(moduleTest.getHttpsServer(), 'listen').throws('Error!!!');
  return moduleTest
    .listen()
    .catch((err) => {
      assert.equal(err.name, 'Error!!!', 'should reject promise with Error!!!');
      sandbox.restore();
    })
    .then(() => moduleTest.destroy());
});


test('server.ts destroy()', (assert) => {
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

test('server.ts destroy() error', (assert) => {
  let sandbox = sinon.sandbox.create();
  let listenHttpStub = sandbox.stub(moduleTest.getHttpServer(), 'close').throws('Error!!!');
  let listenHttpsStub = sandbox.stub(moduleTest.getHttpsServer(), 'close').throws('Error!!!');
  return moduleTest
    .destroy()
    .catch((err) => {
      assert.equal(err.name, 'Error!!!', 'should reject promise with Error!!!');
      sandbox.restore();
    });
});

test('server.ts start()', (assert) => {
  let sandbox = sinon.sandbox.create();
  let listenSpy = sandbox.spy(moduleTest, 'listen');
  return moduleTest
    .start()
    .then(() => {
      assert.equal(listenSpy.called, true, 'should call ServerModule.listen()');
      sandbox.restore();
    })
    .then(() => moduleTest.destroy());
});

test('server.ts environment variables', (assert) => {
  process.env.SERVERMODULE_HOST = '1.0.0.0';
  process.env.SERVERMODULE_HTTP_PORT = '10000';
  process.env.SERVERMODULE_HTTPS_ENABLE = 1;
  process.env.SERVERMODULE_HTTPS_PORT = '10001';
  process.env.SERVERMODULE_HTTPS_KEY = './testkey.pem';
  process.env.SERVERMODULE_HTTPS_CERT = './testcert.pem';

  let config = ServerDefaultConfig();
  assert.equal(config.options.https.enable, true, 'should enable https');
  assert.equal(config.options.host, process.env.SERVERMODULE_HOST, 'should configure host');
  assert.equal(config.options.http.port, process.env.SERVERMODULE_HTTP_PORT, 'should configure http port');
  assert.equal(config.options.https.port, process.env.SERVERMODULE_HTTPS_PORT, 'should configure https port');
  assert.equal(config.options.https.options.key, process.env.SERVERMODULE_HTTPS_KEY, 'should configure https key');
  assert.equal(config.options.https.options.cert, process.env.SERVERMODULE_HTTPS_CERT, 'should configure cert');
  assert.equal(config.options.host, process.env.SERVERMODULE_HOST, 'should configure host');

  assert.end();
});


