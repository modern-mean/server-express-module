import * as test from 'blue-tape';
import * as supertest from 'supertest';
import * as indexTest from '../src/index';

test('index.ts export ExpressModule', (assert) => {
  assert.notEqual(indexTest.ExpressModule, undefined, 'Should not be undefined');
  assert.end();
});

process.env.APIMODULE_FORCESSL_DISABLE = 1;

let api = new indexTest.ApiModule();
let express = new indexTest.ExpressModule(api);
let server = new indexTest.ServerModule(express);

let newRouter = api.router('testrouter', 102, '/test');
newRouter.get('/', (req: indexTest.ApiRequest, res) => {
  res.json('I am here. Version: ' + req.apiversion);
});

api.enable();
express.enable();

test('supertest: API Root router', (assert) => {
  let version = 'v1';
  supertest(express.get())
    .get('/api')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      assert.equal(res.body, 'Welcome to the Modern-Mean API Module');
      assert.end();
    });
});

test('supertest: API Version router', (assert) => {
  let version = 'v1';
  supertest(express.get())
    .get('/api/' + version)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      assert.equal(res.body, 'Welcome to the Modern-Mean API Module Version: ' + version, 'should contain welcome message');
      assert.end();
    });
});

test('supertest: API Version router v2', (assert) => {
  let version = 'v2';
  supertest(express.get())
    .get('/api/'+version)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      assert.equal(res.body, 'Welcome to the Modern-Mean API Module Version: ' + version, 'should contain welcome message');
      assert.end();
    });
});

test('supertest: API new router', (assert) => {
  let version = 'v1';
  supertest(express.get())
    .get('/api/'+version+'/test')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      assert.equal(res.headers['access-control-allow-origin'], '*', 'should enable cors');
      assert.equal(res.body, 'I am here. Version: ' + version, 'should contain welcome message');
      assert.end();
    });
});



