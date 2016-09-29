import * as http from 'http';
import * as https from 'https';
import * as express from 'express';
import * as fs from 'fs';
import { BaseModule, ModuleConfig, LoggerOptions, createConfig } from '@modern-mean/server-base-module';

//Default Middleware
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as forceSSL from 'express-force-ssl';

export class ExpressModule extends BaseModule {

  protected express: Express.Application;
  protected expressApp: express.Application;
  protected httpServer: http.Server;
  protected httpsServer: https.Server;
  protected config: ModuleConfig;
  protected middleware: Middleware[];
  protected middlewareEnabled: boolean;

  constructor(...args) {

    super(...args);

    //Set Config
    this.config = this.configModule.defaults(ExpressDefaultConfig());
    

    //Properties
    this.express = express;
    this.expressApp = undefined;
    this.httpServer = undefined;
    this.httpsServer = undefined;
    this.middleware = DefaultMiddleware();
    
    this.logger.debug('Express::Constructor::Start');
    this.expressApp = express();
    this.httpServer = http.createServer(this.expressApp);
    if (this.config.options.https.enable) {
      let httpsOptions = {
        key: fs.readFileSync(this.config.options.https.options.key),
        cert: fs.readFileSync(this.config.options.https.options.cert)
      };
      this.httpsServer = https.createServer(httpsOptions, this.expressApp);
    }

    this.logger.debug('Express::Constructor::Success');

  }

  enableMiddleware(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.middleware
          .filter(item => item.enable)
          .sort((a, b) => {
            if (a.priority > b.priority) {
              return 1;
            }
            if (a.priority < b.priority) {
              return -1;
            }
            return 0;
          })
          .forEach(item => {
            this.logger.debug('Express::enableMiddleware::' + item.name);
            this.expressApp.use(item.middleware);
          });
        this.middlewareEnabled = true;
        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  listen(): Promise<[ http.Server, https.Server | void ]> {
    this.logger.debug('Express::Listen::Start');
    this.logger.info('Environment:     ' + process.env.NODE_ENV);
    let httpServerPromise: Promise<http.Server> = new Promise((resolve, reject) => {

      this.httpServer.once('error', err => {
        this.logger.error('Express::Listen::Http::Error', err);
        return reject(err);
      });
      this.logger.debug('Express::Listen::Https::Start');
      this.httpServer.listen({ port: this.config.options.http.port, host: this.config.options.host }, () => {
        this.logger.debug('Express::Listen::Http::Success');
        this.logger.info('HTTP Server:     ' + this.httpServer.address().address + ':' + this.httpServer.address().port);
        return resolve(this.httpServer);
      });

    });

    let httpsServerPromise: Promise<void | https.Server> = new Promise((resolve, reject) => {
      if (!this.config.options.https.enable) {
        return resolve();
      }
      this.logger.debug('Express::Listen::Https::Start');

      this.httpsServer.once('error', err => {
        this.logger.error('Express::Listen::Https::Error', err);
        return reject(err);
      });

      this.httpsServer.listen({ port: this.config.options.https.port, host: this.config.options.host }, () => {
        this.logger.debug('Express::Listen::Https::Success');
        this.logger.info('HTTPS Server:  ' + this.httpsServer.address().address + ':' + this.httpsServer.address().port);
        return resolve(this.httpsServer);
      });

    });

    return Promise.all([httpServerPromise, httpsServerPromise]);
  }

  destroy(): Promise<[ void, void ]> {
    this.logger.debug('Express::Destroy::Start');
    let httpServerPromise: Promise<void> = new Promise((resolve, reject) => {
      this.logger.debug('Express::Destroy::Http::Start');

      if (!this.httpServer || !this.httpServer.listening) {
        this.logger.debug('Express::Destroy::Http::NotListening');
        return resolve();
      }
      this.logger.debug('Express::Destroy::Http::Destroying');

      this.httpServer.on('close', () => {
        return resolve();
      });
      
      this.httpServer.close();
    });

    let httpsServerPromise: Promise<void> = new Promise((resolve, reject) => {
      try {
        this.logger.debug('Express::Destroy::Https::Start');
        if (!this.httpsServer) {  //TODO Evidently https.Server does not have a .listening property
          this.logger.debug('Express::Destroy::Https::NotListening');
          return resolve();
        }
        this.logger.debug('Express::Destroy::Https::Start');
        
        this.httpsServer.on('close', () => {
          return resolve();
        });
        
        this.httpsServer.close();
      } catch (err) {
        return reject(err);
      }
    });

    return Promise.all([httpServerPromise, httpsServerPromise]);
  }

  getHttpServer(): http.Server {
    return this.httpServer;
  }

  getHttpsServer(): https.Server {
    return this.httpsServer;
  }

  getExpressApp(): express.Application {
    return this.expressApp;
  }

  getMiddleware(filter?:string): Middleware[] {
    if (filter) {
      return this.middleware.filter(item => item.name === filter);
    }
    return this.middleware;
  }

  addMiddleware(middleware: Middleware): Promise<Middleware[]> {
    return new Promise((resolve) => {
      let current = this.getMiddleware(middleware.name);
      if (current.length === 1) {
        this.middleware[this.middleware.indexOf(current[0])] = middleware;
      } else if (current.length > 1) {
        this.logger.error('Express::addMiddleware::Duplicate Middleware on stack!');
      }
      else {
        this.middleware.push(middleware);
      }
      return resolve(this.middleware);
    });
  }

}

export interface ExpressOptions {
  host?: string,
  http?: {
    port?: string,
  },
  https?: {
    enable?: boolean,
    port?: string,
    options?: https.ServerOptions
  }
}

export interface Middleware {
  enable: boolean,
  name: string,
  priority: number,
  middleware: express.RequestHandler
}

export function ExpressDefaultConfig(): ModuleConfig {
  let options: ExpressOptions = {
    host: process.env.EXPRESSMODULE_HOST || '0.0.0.0',
    http: {
      port: process.env.EXPRESSMODULE_HTTP_PORT || '8080',
    },
    https: {
      enable: process.env.EXPRESSMODULE_HTTPS_ENABLE ? true : false, //Enabling SSL makes the entire site forced over SSL.
      port: process.env.EXPRESSMODULE_HTTPS_PORT || '8443',
      options: {
        key: process.env.EXPRESSMODULE_HTTPS_KEY || process.cwd() + '/ssl/key.pem',
        cert: process.env.EXPRESSMODULE_HTTPS_CERT || process.cwd() + '/ssl/cert.pem'
      }
    }
  };
  let config: ModuleConfig = {
    module: 'ExpressModule',
    type: 'config',
    options: options
  };
  return config;
}

export function ExpressLoggerConfig(): ModuleConfig {
  let options: LoggerOptions = {
    level:  process.env.EXPRESSMODULE_LOG_LEVEL,
    file: process.env.EXPRESSMODULE_LOG_FILE,
    console: process.env.EXPRESSMODULE_LOG_CONSOLE
  };
  let config: ModuleConfig = createConfig('ExpressModule');
  config.options = options;

  return config;
}

export function DefaultMiddleware() : Middleware[] {
  return [{
    enable: process.env.EXPRESSMODULE_HELMET_DISABLE ? false : true,
    name: 'helmet',
    priority: 100,
    middleware: helmet()
  },
  {
    enable: process.env.EXPRESSMODULE_MORGAN_DISABLE ? false : true,
    name: 'morgan',
    priority: 100,
    middleware: morgan(process.env.EXPRESSMODULE_MORGAN_FORMAT || 'short')
  },
  {
    enable: process.env.EXPRESSMODULE_FORCESSL_ENABLE ? true : false,
    name: 'forcessl',
    priority: 100,
    middleware: forceSSL
  }];
}

