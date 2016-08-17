'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let logger;

if (logger === undefined) {
  let transports = [];

  if (_config2.default.logs.winston.file === 'true') {
    transports.push(new _winston2.default.transports.File({ filename: _config2.default.logs.winston.file }));
  }

  if (_config2.default.logs.winston.console === 'true') {
    transports.push(new _winston2.default.transports.Console());
  }

  logger = new _winston2.default.Logger({
    level: _config2.default.logs.winston.level,
    transports: transports
  });
}

exports.default = logger;