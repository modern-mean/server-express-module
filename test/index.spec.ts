import * as test from 'blue-tape';
import * as indexTest from '../src/index';

test('index.ts export ExpressModule', (assert) => {
  assert.notEqual(indexTest.ExpressModule, undefined, 'Should not be undefined');
  assert.end();
});
