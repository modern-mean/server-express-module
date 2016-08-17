'use strict';

import { MMExpress } from '../src/express';
import express from 'express';
import http from 'http';
import https from 'https';

let sandbox,
  expressTest;

describe('/src/express.js', () => {

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return expressTest = new MMExpress();
  });

  afterEach(() => {
    sandbox.restore();
    return expressTest.destroy();
  });


  describe('constructor', () => {

    it('should be an object', () => {
      return expressTest.should.be.an('object');
    });

    it('should create an express app', () => {
      expressTest.getExpressApp().should.be.a('function');
      return expressTest.getExpressApp().use.should.be.a('function');
    });

    it('should create an http server', () => {
      return expect(expressTest.getHttpServer() instanceof http.Server).to.equal(true);
    });

    it('should create an https server', () => {
      return expect(expressTest.getHttpsServer() instanceof https.Server).to.equal(true);
    });



  });

  describe('listen', () => {

    describe('success', () => {

      let httpStub, httpsStub;

      beforeEach(() => {
        httpStub = sandbox.stub(expressTest.getHttpServer(), 'listen').yields();
        httpsStub = sandbox.stub(expressTest.getHttpsServer(), 'listen').yields();
        sandbox.stub(expressTest.getHttpServer(), 'address').returns({ address: '127.0.0.1', port: '8080' });
        sandbox.stub(expressTest.getHttpsServer(), 'address').returns({ address: '127.0.0.1', port: '8443' });
        return expressTest.listen();
      });

      it('should be a function', () => {
        return expressTest.listen.should.be.a('function');
      });

      it('should call httpServer.listen', () => {
        return httpStub.should.have.been.called;
      });

      it('should call httpsServer.listen', () => {
        return httpsStub.should.have.been.called;
      });

    });

    describe('error', () => {
      let firstExpress = new MMExpress();

      beforeEach(() => {
        return firstExpress.listen();
      });

      afterEach(() => {
        return firstExpress.destroy();
      });

      it('should reject a the promise on http/https failure', () => {
        return expressTest.listen().should.eventually.be.rejected;
      });

    });

  });

  describe('destroy', () => {

    describe('success', () => {

      beforeEach(() => {
        return expressTest.listen()
          .then(() => expressTest.destroy())
          .catch(err => { console.log(err); });
      });

      it('should destroy httpServer', () => {
        return expect(expressTest.getHttpServer()).to.equal(undefined);
      });

      it('should destroy httpsServer', () => {
        return expect(expressTest.getHttpsServer()).to.equal(undefined);
      });

      it('should destroy expressApp', () => {
        return expect(expressTest.getExpressApp()).to.equal(undefined);
      });



    });

  });




});
