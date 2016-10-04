import * as express from 'express';
import { BaseModule, LoggerOptions, ModuleConfig, createConfig } from '@modern-mean/server-base-module';
import { MiddlewareManager, Middleware } from './middleware';

//Default Middleware
import * as cors from 'cors';
import * as forceSSL from 'express-force-ssl';

export interface ApiRequest extends express.Request {
  apiversion: string
}

export interface ApiOptions {
  welcome: string,
  route: string,
  cors: {
    enable: boolean,
    options: cors.CorsOptions
  }
}

export interface ApiModuleInterface {
  middleware: MiddlewareManager,
  getRouter(): express.Router
}

export class ApiModule extends BaseModule implements ApiModuleInterface {

  middleware: MiddlewareManager;
  protected router: express.Router;
  protected config: ModuleConfig;

  constructor(...args) {

    super(ApiLoggerConfig(), ...args);

    //Set Config
    this.config = this.configModule.defaults(ApiDefaultConfig());

    this.router = express.Router();

    this.router.param('version', (req: ApiRequest, res, next, id) => {
      req.apiversion = id;
      return next();
    });

    this.router
      .route('/')
        .get((req: ApiRequest, res) => {
          res.json(this.config.options.welcome + ' Version: ' + req.apiversion);
        });

    //Set Middleware
    this.middleware = new MiddlewareManager();
    this.middleware.add(DefaultMiddleware());
    this.logger.debug('ApiModule::Constructor::Done');
  }

  getRouter(): express.Router {
    return this.router;
  }

  enable(): Middleware {
    this.middleware.enable(this.router);
    return this.middleware.create('apirouter', 101, this.router, this.config.options.route);
  }

}

function DefaultMiddleware() : Middleware[] {
  return [{
    enable: process.env.APIMODULE_CORS_DISABLE ? false : true,
    name: 'cors',
    priority: 100,
    middleware: cors()
  },
  {
    enable: process.env.APIMODULE_FORCESSL_DISABLE ? false : true,
    name: 'forcessl',
    priority: 100,
    middleware: forceSSL
  }];
}

export function ApiDefaultConfig(): ModuleConfig {
  let options = {
    welcome: process.env.APIMODULE_WELCOME || 'Welcome to the Modern-Mean API Module',
    route: (process.env.APIMODULE_ROUTE || '/api') + '/:version'
  };
  let config: ModuleConfig = createConfig('ApiModule');
  config.options = options;
  return config;
}

export function ApiLoggerConfig(): ModuleConfig {
  let options: LoggerOptions = {
    level:  process.env.APIMODULE_LOG_LEVEL,
    file: process.env.APIMODULE_LOG_FILE,
    console: process.env.APIMODULE_LOG_CONSOLE ? false : true
  };
  let config: ModuleConfig = createConfig('LoggerModule');
  config.options = options;

  return config;
}


