import * as indexTest from '../src/index';

let sandbox;

describe('/src/index.js', () => {

  beforeEach(() => {
    return sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    return sandbox.restore();
  });


  describe('export', () => {

    it('should export ExpressModule', () => {
      return indexTest.ExpressModule.should.exist;
    });

  });

});
