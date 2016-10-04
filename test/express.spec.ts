import { ExpressModule } from '../src/express';
import { BaseModule, ModuleConfig, LoggerOptions, createConfig } from '@modern-mean/server-base-module';
import { MiddlewareManager, Middleware } from '../src/middleware';
import { ApiModule } from '../src/api';
import * as test from 'blue-tape';
import * as express from 'express';
import * as morgan from 'morgan';
import * as sinon from 'sinon';

let moduleTest = new ExpressModule();

test('express.ts constructor default config', (assert) => {
  assert.pass('should run without failure');
  assert.equal(moduleTest.middleware.get().length, 4, 'should initialize default middleware');
  assert.notEqual(moduleTest.middleware.get('apirouter'), undefined, 'should initialize apirouter middleware');
  assert.end();
});

test('express.ts router()', (assert) => {
  assert.equal(typeof moduleTest.router().use, 'function', 'should return an express router');
  assert.end();
});

test('express.ts get()', (assert) => {
  assert.equal(typeof moduleTest.get().use, 'function', 'should return express application');
  assert.end();
});
