'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MMExpress = undefined;

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serverLoggerModule = require('@modern-mean/server-logger-module');

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _expressForceSsl = require('express-force-ssl');

var _expressForceSsl2 = _interopRequireDefault(_expressForceSsl);

var _serverDestroy = require('server-destroy');

var _serverDestroy2 = _interopRequireDefault(_serverDestroy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MMExpress {

  constructor() {
    //Properties
    this.expressApp = undefined;
    this.httpServer = undefined;
    this.httpsServer = undefined;

    //Initaite logger
    let logger = new _serverLoggerModule.MMLogger(_config2.default.logs);
    this.logger = logger.get();

    this.logger.debug('Express::Constructor::Start', _config2.default);
    this.expressApp = (0, _express2.default)();
    this.httpServer = _http2.default.createServer(this.expressApp);
    if (_config2.default.https.enable === 'true') {
      let httpsOptions = {
        key: _fs2.default.readFileSync(_config2.default.https.options.key),
        cert: _fs2.default.readFileSync(_config2.default.https.options.cert)
      };
      this.httpsServer = _https2.default.createServer(httpsOptions, this.expressApp);
    }

    //Middleware
    if (_config2.default.https.enable === 'true') {
      this.expressApp.set('forceSSLOptions', {
        httpsPort: _config2.default.https.port
      });
      this.logger.debug('Express::Middleware::ForceSSL');
      this.expressApp.use(_expressForceSsl2.default);
    }

    if (_config2.default.logs.morgan.enable === 'true') {
      this.logger.debug('Express::Middleware::Morgan');
      this.expressApp.use((0, _morgan2.default)(_config2.default.logs.morgan.format, _config2.default.logs.morgan.options));
    }

    if (_config2.default.helmet.enable === 'true') {
      this.logger.debug('Express::Middleware::Helmet');
      this.expressApp.use((0, _helmet2.default)(_config2.default.helmet.config));
    }

    this.logger.verbose('Express::Constructor::Success');
  }

  listen() {
    this.logger.debug('Express::Listen::Start');
    this.logger.info('Environment:     ' + process.env.NODE_ENV);
    let httpServerPromise = new Promise((resolve, reject) => {

      this.httpServer.once('error', err => {
        this.logger.error('Express::Listen::Http::Error', err);
        reject(err);
      });
      this.logger.debug('Express::Listen::Https::Start');
      this.httpServer.listen({ port: _config2.default.http.port, host: _config2.default.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if (process.env.NODE_ENV !== 'production') {

          (0, _serverDestroy2.default)(this.httpServer);
          this.logger.debug('Express::Listen::Http::EnableDestroy');
        }
        this.logger.debug('Express::Listen::Http::Success');
        this.logger.info('HTTP Server:     ' + this.httpServer.address().address + ':' + this.httpServer.address().port);
        return resolve(this.httpServer);
      });
    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      if (_config2.default.https.enable !== 'true') {
        return resolve();
      }
      this.logger.debug('Express::Listen::Https::Start');

      this.httpsServer.once('error', err => {
        this.logger.error('Express::Listen::Https::Error', err);
        reject(err);
      });

      this.httpsServer.listen({ port: _config2.default.https.port, host: _config2.default.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if (process.env.NODE_ENV !== 'production') {
          this.logger.debug('Express::Listen::Http::EnableDestroy');
          (0, _serverDestroy2.default)(this.httpsServer);
        }
        this.logger.debug('Express::Listen::Https::Success');
        this.logger.info('HTTPS Server:  ' + this.httpsServer.address().address + ':' + this.httpsServer.address().port);
        return resolve(this.httpsServer);
      });
    });

    return Promise.all([httpServerPromise, httpsServerPromise]);
  }

  destroy() {
    this.logger.debug('Express::Destroy::Start');
    let httpServerPromise = new Promise((resolve, reject) => {
      this.logger.debug('Express::Destroy::Http::Start');

      if (!this.httpServer || !this.httpServer.listening) {
        this.logger.debug('Express::Destroy::Http::NotListening');
        this.httpServer = undefined;
        return resolve();
      }
      this.logger.debug('Express::Destroy::Http::Destroying');

      this.httpServer.destroy(() => {
        this.httpServer = undefined;
        this.logger.debug('Express::Destroy::Http::Success');
        return resolve();
      });
    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      this.logger.debug('Express::Destroy::Https::Start');
      if (!this.httpsServer || !this.httpsServer.listening) {
        this.logger.debug('Express::Destroy::Https::NotListening');
        this.httpsServer = undefined;
        return resolve();
      }
      this.logger.debug('Express::Destroy::Https::Start');
      this.httpsServer.destroy(() => {
        this.httpsServer = undefined;
        this.logger.debug('Express::Destroy::Https::Success');
        return resolve();
      });
    });

    return Promise.all([httpServerPromise, httpsServerPromise]).then(() => {
      this.expressApp = undefined;
      this.logger.verbose('Express::Destroy::Success');
    });
  }

  getHttpServer() {
    return this.httpServer;
  }

  getHttpsServer() {
    return this.httpsServer;
  }

  getExpressApp() {
    return this.expressApp;
  }

}
exports.MMExpress = MMExpress;