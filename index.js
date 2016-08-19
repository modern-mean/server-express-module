'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('./dist/express');

Object.keys(_express).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _express[key];
    }
  });
});

var _config = require('./dist/config');

Object.keys(_config).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _config[key];
    }
  });
});