'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  host: process.env.MM_EXPRESS_HOST || '0.0.0.0',
  http: {
    port: process.env.MM_EXPRESS_HTTP_PORT || '8080'
  },
  https: {
    enable: process.env.MM_EXPRESS_HTTPS || 'true', //Enabling SSL makes the entire site forced over SSL.
    port: process.env.MM_EXPRESS_HTTPS_PORT || '8443',
    options: {
      key: process.env.MM_EXPRESS_HTTPS_KEY || __dirname + '/../ssl/key.pem',
      cert: process.env.MM_EXPRESS_HTTPS_CERT || __dirname + '/../ssl/cert.pem'
    }
  },
  logs: {
    //https://github.com/expressjs/morgan
    morgan: {
      enable: process.env.MM_EXPRESS_MORGAN_ENABLE || 'true',
      format: process.env.MM_EXPRESS_MORGAN_FORMAT || 'short'
    },
    //https://github.com/winstonjs/winston
    winston: {
      level: process.env.MM_EXPRESS_LOG_LEVEL || process.env.MM_LOG_LEVEL || 'info', //{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
      file: process.env.MM_EXPRESS_LOG_FILE || process.env.MM_LOG_FILE || 'false',
      console: process.env.MM_EXPRESS_LOG_CONSOLE || process.env.MM_LOG_CONSOLE || 'true'
    }
  },
  helmet: {
    enable: process.env.MM_EXPRESS_HELMET_ENABLE || 'true',
    config: {}
  }
};