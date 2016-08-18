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

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

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

    _logger2.default.debug('Express::Constructor::Start', _config2.default);
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
      _logger2.default.debug('Express::Middleware::ForceSSL');
      this.expressApp.use(_expressForceSsl2.default);
    }

    if (_config2.default.logs.morgan.enable === 'true') {
      _logger2.default.debug('Express::Middleware::Morgan');
      this.expressApp.use((0, _morgan2.default)(_config2.default.logs.morgan.format, _config2.default.logs.morgan.options));
    }

    if (_config2.default.helmet.enable === 'true') {
      _logger2.default.debug('Express::Middleware::Helmet');
      this.expressApp.use((0, _helmet2.default)(_config2.default.helmet.config));
    }

    _logger2.default.verbose('Express::Constructor::Success');
  }

  listen() {
    _logger2.default.debug('Express::Listen::Start');
    _logger2.default.info('Environment:     ' + process.env.NODE_ENV);
    let httpServerPromise = new Promise((resolve, reject) => {

      this.httpServer.once('error', err => {
        _logger2.default.error('Express::Listen::Http::Error', err);
        reject(err);
      });
      _logger2.default.debug('Express::Listen::Https::Start');
      this.httpServer.listen({ port: _config2.default.http.port, host: _config2.default.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if (process.env.NODE_ENV !== 'production') {

          (0, _serverDestroy2.default)(this.httpServer);
          _logger2.default.debug('Express::Listen::Http::EnableDestroy');
        }
        _logger2.default.debug('Express::Listen::Http::Success');
        _logger2.default.info('HTTP Server:     ' + this.httpServer.address().address + ':' + this.httpServer.address().port);
        return resolve(this.httpServer);
      });
    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      if (_config2.default.https.enable !== 'true') {
        return resolve();
      }
      _logger2.default.debug('Express::Listen::Https::Start');

      this.httpsServer.once('error', err => {
        _logger2.default.error('Express::Listen::Https::Error', err);
        reject(err);
      });

      this.httpsServer.listen({ port: _config2.default.https.port, host: _config2.default.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if (process.env.NODE_ENV !== 'production') {
          _logger2.default.debug('Express::Listen::Http::EnableDestroy');
          (0, _serverDestroy2.default)(this.httpsServer);
        }
        _logger2.default.debug('Express::Listen::Https::Success');
        _logger2.default.info('HTTPS Server:  ' + this.httpsServer.address().address + ':' + this.httpsServer.address().port);
        return resolve(this.httpsServer);
      });
    });

    return Promise.all([httpServerPromise, httpsServerPromise]);
  }

  destroy() {
    _logger2.default.debug('Express::Destroy::Start');
    let httpServerPromise = new Promise((resolve, reject) => {
      _logger2.default.debug('Express::Destroy::Http::Start');

      if (!this.httpServer || !this.httpServer.listening) {
        _logger2.default.debug('Express::Destroy::Http::NotListening');
        this.httpServer = undefined;
        return resolve();
      }
      _logger2.default.debug('Express::Destroy::Http::Destroying');

      this.httpServer.destroy(() => {
        this.httpServer = undefined;
        _logger2.default.debug('Express::Destroy::Http::Success');
        return resolve();
      });
    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      _logger2.default.debug('Express::Destroy::Https::Start');
      if (!this.httpsServer || !this.httpsServer.listening) {
        _logger2.default.debug('Express::Destroy::Https::NotListening');
        this.httpsServer = undefined;
        return resolve();
      }
      _logger2.default.debug('Express::Destroy::Https::Start');
      this.httpsServer.destroy(() => {
        this.httpsServer = undefined;
        _logger2.default.debug('Express::Destroy::Https::Success');
        return resolve();
      });
    });

    return Promise.all([httpServerPromise, httpsServerPromise]).then(() => {
      this.expressApp = undefined;
      _logger2.default.verbose('Express::Destroy::Success');
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