import { MiddlewareManager, Middleware } from '../src/middleware';
import * as test from 'blue-tape';
import * as sinon from 'sinon';
import * as express from 'express';

test('middleware.ts constructor', (assert) => {
  let moduleTest = new MiddlewareManager();
  assert.equal(moduleTest.get().length, 0, 'should initialize middleware array');
  assert.end();
});

let moduleTest = new MiddlewareManager();

let middleware1: Middleware = moduleTest.create('testmiddleware1', 100, (req, res, next) => {});
let middleware2: Middleware = moduleTest.create('testmiddleware2', 1, (req, res, next) => {});
let middleware3: Middleware = moduleTest.create('testmiddleware3', 3, (req, res, next) => {});
let middleware4: Middleware = moduleTest.create('testmiddleware4', 3, (req, res, next) => {});
let middleware5: Middleware = moduleTest.create('testmiddleware5', 3, (req, res, next) => {});
let middleware6: Middleware = moduleTest.create('testmiddleware5', 3, (req, res, next) => {});
let middleware7: Middleware = moduleTest.create('testmiddleware7', 101, (req, res, next) => {});

test('middleware.ts add()', (assert) => {
  return moduleTest
    .add([middleware1, middleware2, middleware3, middleware4, middleware5, middleware6, middleware7])
    .then(() => {
      assert.equal(moduleTest.get().length, 6, 'middleware stack length should be 6');
    });
});

test('middleware.ts enable() success', (assert) => {
  let app = express();
  let sandbox = sinon.sandbox.create();
  let useStub = sandbox.stub(app, 'use');
  let middleware = moduleTest.get();
  middleware3.enable = false;
  let disableSpy = sandbox.spy(middleware3, 'middleware');
  let replaceSpy = sandbox.spy(middleware5, 'middleware');
  let prioritySpy = sandbox.spy(middleware7, 'middleware');

  return moduleTest.enable(app)
    .then(() => {
      assert.equal(prioritySpy.called, false, 'should not enable middleware over 100 priority middleware');
      assert.equal(disableSpy.called, false, 'should not enable disabled middleware');
      assert.equal(replaceSpy.called, false, 'should not enable middleware that has been replaced');
      assert.equal(useStub.args[0][0], middleware2.middleware, 'should enable middleware2 first');
      assert.equal(useStub.args[1][0], middleware4.middleware, 'should enable middleware4 second');
      assert.equal(useStub.args[2][0], middleware6.middleware, 'should enable middleware6 third');
      assert.equal(useStub.args[3][0], middleware1.middleware, 'should enable middleware1 fourth');
      sandbox.restore();
    });
});

test('middleware.ts enable() error', (assert) => {
  let middleware8: Middleware = moduleTest.create('testmiddleware8', 100, (req, res, next) => {});
  let app = express();
  let sandbox = sinon.sandbox.create();
  let useStub = sandbox.stub(app, 'use').throws('Error!!!');
  return moduleTest
    .add([middleware8])
    .then(() => moduleTest.enable(app))
    .catch(err => {
      assert.equal(err.name, 'Error!!!', 'should reject with error');
      sandbox.restore();
    });
});

test('middleware.ts remove()', (assert) => {
  let removed = moduleTest.remove(middleware1.name);
  assert.equal(removed[0], middleware1, 'should return removed middleware');
  assert.equal(moduleTest.get('middleware1').length, 0, 'should remove middleware from stack');
  assert.end();
});



