'use strict';

import http from 'http';
import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import forceSSL from 'express-force-ssl';
import enableDestroy from 'server-destroy';
import config from './config';
import logger from './logger';
import { MMBase } from '@modern-mean/server-base-module';



export class MMExpress extends MMBase {

  constructor(...args) {
    //Push default configuration to front of array.  Passed in configuration from ...args should take precedence.
    args.unshift({ MMConfig: config, MMLogger: logger });
    super(...args);

    this.config = this.getConfigModule().get();
    this.logger = this.getLoggerModule().get();

    //Properties
    this.expressApp = undefined;
    this.httpServer = undefined;
    this.httpsServer = undefined;

    this.logger.debug('Express::Constructor::Start');
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);
    if (this.config.https.enable === 'true') {
      let httpsOptions = {
        key: fs.readFileSync(this.config.https.options.key),
        cert: fs.readFileSync(this.config.https.options.cert)
      };
      this.httpsServer = https.createServer(httpsOptions, this.expressApp);
    }

    //Middleware
    if (this.config.https.enable === 'true') {
      this.expressApp.set('forceSSLOptions', {
        httpsPort: this.config.https.port
      });
      this.logger.debug('Express::Middleware::ForceSSL');
      this.expressApp.use(forceSSL);
    }

    if (this.config.logs.morgan.enable === 'true') {
      this.logger.debug('Express::Middleware::Morgan');
      this.expressApp.use(morgan(this.config.logs.morgan.format, this.config.logs.morgan.options));
    }

    if (this.config.helmet.enable === 'true') {
      this.logger.debug('Express::Middleware::Helmet');
      this.expressApp.use(helmet(this.config.helmet.config));
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
      this.httpServer.listen({ port: this.config.http.port, host: this.config.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if(process.env.NODE_ENV !== 'production') {

          enableDestroy(this.httpServer);
          this.logger.debug('Express::Listen::Http::EnableDestroy');
        }
        this.logger.debug('Express::Listen::Http::Success');
        this.logger.info('HTTP Server:     ' + this.httpServer.address().address + ':' + this.httpServer.address().port);
        return resolve(this.httpServer);
      });

    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      if (this.config.https.enable !== 'true') {
        return resolve();
      }
      this.logger.debug('Express::Listen::Https::Start');

      this.httpsServer.once('error', err => {
        this.logger.error('Express::Listen::Https::Error', err);
        reject(err);
      });

      this.httpsServer.listen({ port: this.config.https.port, host: this.config.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if(process.env.NODE_ENV !== 'production') {
          this.logger.debug('Express::Listen::Http::EnableDestroy');
          enableDestroy(this.httpsServer);
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

    return Promise.all([httpServerPromise, httpsServerPromise])
            .then(() => {
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
