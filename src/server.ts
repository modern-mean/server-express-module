import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { BaseModule, ModuleConfig, LoggerOptions, createConfig } from '@modern-mean/server-base-module';
import { ExpressModule } from './express';

export interface ServerOptions {
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

export interface ServerModuleInterface {
  listen(): Promise<[ http.Server, https.Server | void ]>,
  destroy(): Promise<[ void, void ]>,
  getHttpServer(): http.Server,
  getHttpsServer(): https.Server
}

export class ServerModule extends BaseModule implements ServerModuleInterface {

  protected express: ExpressModule;
  protected httpServer: http.Server;
  protected httpsServer: https.Server;
  protected config: ModuleConfig;

  constructor(...args) {
    super(ServerLoggerConfig(), ...args);
    this.logger.debug('Server::Constructor::Start');

    args.forEach(arg => {
      if (arg instanceof ExpressModule) {
        this.express = arg;
      }
    });

    //Set Config
    this.config = this.configModule.defaults(ServerDefaultConfig());

    if (!this.express) {
      //Express
      this.express = new ExpressModule();
    }


    //Servers
    this.httpServer = http.createServer(this.express.get());
    if (this.config.options.https.enable) {
      this.logger.debug('Server::Constructor::HTTPS::Enable');
      let httpsOptions = this.config.options.https.options;
      httpsOptions.key = fs.readFileSync(httpsOptions.key);
      httpsOptions.cert = fs.readFileSync(httpsOptions.cert);
      this.httpsServer = https.createServer(httpsOptions, this.express.get());
    }

    this.logger.debug('Server::Constructor::Success');

  }

  start(): Promise<[ http.Server, https.Server | void ]> {
    this.express.enable();
    return this.listen();
  }

  listen(): Promise<[ http.Server, https.Server | void ]> {
    this.logger.debug('Server::Listen::Start');
    this.logger.info('Environment:     ' + process.env.NODE_ENV);
    let httpServerPromise: Promise<http.Server> = new Promise((resolve, reject) => {
      try {
        /* istanbul ignore next */
        this.httpServer.once('error', err => {
          this.logger.error('Server::Listen::Http::Error', err);
          return reject(err);
        });
        this.logger.debug('Server::Listen::Http::Start');
        this.httpServer.listen({ port: this.config.options.http.port, host: this.config.options.host }, () => {
          this.logger.debug('Server::Listen::Http::Success');
          this.logger.info('HTTP Server:     ' + this.httpServer.address().address + ':' + this.httpServer.address().port);
          return resolve(this.httpServer);
        });
      } catch(err) {
        return reject(err);
      }
    });

    let httpsServerPromise: Promise<void | https.Server> = new Promise((resolve, reject) => {
      if (!this.config.options.https.enable) {
        return resolve();
      }
      this.logger.debug('Server::Listen::Https::Start');

      try {
        /* istanbul ignore next */
        this.httpsServer.once('error', err => {
          this.logger.error('Server::Listen::Https::Error', err);
          return reject(err);
        });

        this.httpsServer.listen({ port: this.config.options.https.port, host: this.config.options.host }, () => {
          this.logger.debug('Server::Listen::Https::Success');
          this.logger.info('HTTPS Server:  ' + this.httpsServer.address().address + ':' + this.httpsServer.address().port);
          return resolve(this.httpsServer);
        });
      } catch (err) {
        return reject(err);
      }
    });

    return Promise.all([httpServerPromise, httpsServerPromise]);
  }

  destroy(): Promise<[ void | Error, void | Error ]> {
    this.logger.debug('Server::Destroy::Start');
    let httpServerPromise: Promise<void> = new Promise((resolve, reject) => {
      this.logger.debug('Server::Destroy::Http::Start');
      try {
        /* istanbul ignore next */
        this.httpServer.on('close', () => {
          return resolve();
        });
        this.httpServer.close();
      } catch(err) {
        return reject(err);
      }
    });

    let httpsServerPromise: Promise<void | Error> = new Promise((resolve, reject) => {
      this.logger.debug('Server::Destroy::Https::Start');
      try {
        /* istanbul ignore next */
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

}

export function ServerDefaultConfig(): ModuleConfig {
  let options: ServerOptions = {
    host: process.env.SERVERMODULE_HOST || '0.0.0.0',
    http: {
      port: process.env.SERVERMODULE_HTTP_PORT || '8080',
    },
    https: {
      enable: process.env.SERVERMODULE_HTTPS_ENABLE ? true : false, //Enabling SSL makes the entire site forced over SSL.
      port: process.env.SERVERMODULE_HTTPS_PORT || '8443',
      options: {
        key: process.env.SERVERMODULE_HTTPS_KEY || process.cwd() + '/ssl/key.pem',
        cert: process.env.SERVERMODULE_HTTPS_CERT || process.cwd() + '/ssl/cert.pem'
      }
    }
  };
  let config: ModuleConfig = createConfig('ServerModule');
  config.options = options;
  return config;
}

export function ServerLoggerConfig(): ModuleConfig {
  let options: LoggerOptions = {
    level:  process.env.SERVERMODULE_LOG_LEVEL,
    file: process.env.SERVERMODULE_LOG_FILE,
    console: process.env.SERVERMODULE_LOG_CONSOLE ? false : true
  };
  let config: ModuleConfig = createConfig('LoggerModule');
  config.options = options;
  return config;
}
