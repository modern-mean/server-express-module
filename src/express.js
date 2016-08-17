'use strict';

import http from 'http';
import https from 'https';
import express from 'express';
import logger from './logger';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import config from './config';
import morgan from 'morgan';
import fs from 'fs';
import forceSSL from 'express-force-ssl';
import enableDestroy from 'server-destroy';


export class MMExpress {

  constructor() {
    //Properties
    this.expressApp = undefined;
    this.httpServer = undefined;
    this.httpsServer = undefined;

    logger.debug('Express::Constructor::Start', config);
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);
    if (config.https.enable === 'true') {
      let httpsOptions = {
        key: fs.readFileSync(config.https.options.key),
        cert: fs.readFileSync(config.https.options.cert)
      };
      this.httpsServer = https.createServer(httpsOptions, this.expressApp);
    }

    //Middleware
    if (config.https.enable === 'true') {
      this.expressApp.set('forceSSLOptions', {
        httpsPort: config.https.port
      });
      logger.debug('Express::Middleware::ForceSSL');
      this.expressApp.use(forceSSL);
    }

    if (config.logs.morgan.enable === 'true') {
      logger.debug('Express::Middleware::Morgan');
      this.expressApp.use(morgan(config.logs.morgan.format, config.logs.morgan.options));
    }

    if (config.helmet.enable === 'true') {
      logger.debug('Express::Middleware::Helmet');
      this.expressApp.use(helmet(config.helmet.config));
    }

    logger.verbose('Express::Constructor::Success');

  }

  listen() {
    logger.debug('Express::Listen::Start');
    logger.info('Environment:     ' + process.env.NODE_ENV);
    let httpServerPromise = new Promise((resolve, reject) => {

      this.httpServer.once('error', err => {
        logger.error('Express::Listen::Http::Error', err);
        reject(err);
      });
      logger.debug('Express::Listen::Https::Start');
      this.httpServer.listen({ port: config.http.port, host: config.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if(process.env.NODE_ENV !== 'production') {

          enableDestroy(this.httpServer);
          logger.debug('Express::Listen::Http::EnableDestroy');
        }
        logger.debug('Express::Listen::Http::Success');
        logger.info('HTTP Server:     ' + this.httpServer.address().address + ':' + this.httpServer.address().port);
        return resolve(this.httpServer);
      });

    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      if (config.https.enable !== 'true') {
        return resolve();
      }
      logger.debug('Express::Listen::Https::Start');

      this.httpsServer.once('error', err => {
        logger.error('Express::Listen::Https::Error', err);
        reject(err);
      });

      this.httpsServer.listen({ port: config.https.port, host: config.host }, () => {
        /* istanbul ignore else: cant test this since production server cant be destroyed  */
        if(process.env.NODE_ENV !== 'production') {
          logger.debug('Express::Listen::Http::EnableDestroy');
          enableDestroy(this.httpsServer);
        }
        logger.debug('Express::Listen::Https::Success');
        logger.info('HTTPS Server:  ' + this.httpsServer.address().address + ':' + this.httpsServer.address().port);
        return resolve(this.httpsServer);
      });

    });

    return Promise.all([httpServerPromise, httpsServerPromise]);
  }

  destroy() {
    logger.debug('Express::Destroy::Start');
    let httpServerPromise = new Promise((resolve, reject) => {
      logger.debug('Express::Destroy::Http::Start');

      if (!this.httpServer || !this.httpServer.listening) {
        logger.debug('Express::Destroy::Http::NotListening');
        this.httpServer = undefined;
        return resolve();
      }
      logger.debug('Express::Destroy::Http::Destroying');

      this.httpServer.destroy(() => {
        this.httpServer = undefined;
        logger.debug('Express::Destroy::Http::Success');
        return resolve();
      });


    });

    let httpsServerPromise = new Promise((resolve, reject) => {
      logger.debug('Express::Destroy::Https::Start');
      if (!this.httpsServer || !this.httpsServer.listening) {
        logger.debug('Express::Destroy::Https::NotListening');
        this.httpsServer = undefined;
        return resolve();
      }
      logger.debug('Express::Destroy::Https::Start');
      this.httpsServer.destroy(() => {
        this.httpsServer = undefined;
        logger.debug('Express::Destroy::Https::Success');
        return resolve();
      });
    });

    return Promise.all([httpServerPromise, httpsServerPromise])
            .then(() => {
              this.expressApp = undefined;
              logger.verbose('Express::Destroy::Success');
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
