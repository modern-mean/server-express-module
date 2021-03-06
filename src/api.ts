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
  route: {
    root: string,
    version: string
  },
  cors: {
    enable: boolean,
    options: cors.CorsOptions
  }
}

export interface ApiModuleInterface {
  middleware: MiddlewareManager,
  config: ModuleConfig,
  get(): express.Router
}

export class ApiModule extends BaseModule implements ApiModuleInterface {

  middleware: MiddlewareManager;
  protected rootRouter: express.Router;
  protected versionRouter: express.Router;
  public config: ModuleConfig;

  constructor(...args) {

    super(ApiLoggerConfig(), ...args);

    //Set Config
    this.config = this.configModule.defaults(ApiDefaultConfig());

    this.rootRouter = express.Router();


    this.rootRouter.param('version', (req: ApiRequest, res, next, id) => {
      req.apiversion = id;
      return next();
    });

    this.rootRouter
      .route('/')
        .get((req, res) => {
          res.json(this.config.options.welcome);
        });

    //Set Middleware
    this.middleware = new MiddlewareManager();
    this.middleware.add(DefaultMiddleware());

    this.versionRouter = express.Router();


    this.versionRouter.route('/')
        .get((req: ApiRequest, res) => {
          res.json(this.config.options.welcome + ' Version: ' + req.apiversion);
        });



    this.logger.debug('ApiModule::Constructor::Done');
  }

  get(): express.Router {
    return this.rootRouter;
  }

  enable(): void {
    this.middleware.enable(this.versionRouter)
      .then(() => this.rootRouter.use(this.config.options.route.version, this.versionRouter));

  }

  router(name:string, priority: number, route: string): express.Router {
    let router = express.Router();
    let middleware = this.middleware.create(name, priority, router, route);
    this.middleware.add([middleware]);
    return router;
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
    route: {
      root: process.env.APIMODULE_ROUTE_ROOT || '/api',
      version: process.env.APIMODULE_ROUTE_VERSION || '/:version',
    }
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


