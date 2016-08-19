zimport chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonPromised from 'sinon-as-promised';
import promised from 'chai-as-promised';
import request from 'supertest';
import config from '../src/config';

chai.use(promised);
chai.use(sinonChai);

global.expect = chai.expect;
global.should = chai.should();
global.sinon = sinon;
global.request = request;

process.env.MM_EXPRESS_HTTPS_PORT = 8444;
process.env.MM_EXPRESS_HTTP_PORT = 8081;

global.config = config;
