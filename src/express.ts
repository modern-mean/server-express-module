import * as express from 'express';
import { BaseModule, ModuleConfig, LoggerOptions, createConfig } from '@modern-mean/server-base-module';
import { MiddlewareManager, Middleware } from './middleware';
import { ApiModule } from './api';

//Default Middleware
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as forceSSL from 'express-force-ssl';

export interface ExpressModuleInterface {
  middleware: MiddlewareManager,
  get(): express.Application,
  router(): express.Router
}

export class ExpressModule extends BaseModule implements ExpressModuleInterface {

  protected app: express.Application;
  protected config: ModuleConfig;
  public middleware: MiddlewareManager;

  constructor(...args) {
    super(LoggerConfig(), ...args);

    this.logger.debug('Express::Constructor::Start');

    //Set Config
    //this.config = this.configModule.defaults(DefaultConfig());

    //Properties
    this.app = express();

    //Set Default Middleware
    this.middleware = new MiddlewareManager();
    this.middleware.add(DefaultMiddleware());

    args.forEach(arg => {
      if (arg instanceof ApiModule) {
        this.middleware.add([this.middleware.create('apirouter', 101, arg.get(), arg.config.options.route.root)]);
      }
    });

    this.logger.debug('Express::Constructor::Success');

  }

  get(): express.Application {
    return this.app;
  }

  enable(): void {
    this.middleware.enable(this.app);
  }

  router(): express.Router {
    return express.Router();
  }

}

function LoggerConfig(): ModuleConfig {
  let options: LoggerOptions = {
    level:  process.env.EXPRESSMODULE_LOG_LEVEL,
    file: process.env.EXPRESSMODULE_LOG_FILE,
    console: process.env.EXPRESSMODULE_LOG_CONSOLE ? false : true
  };
  let config: ModuleConfig = createConfig('LoggerModule');
  config.options = options;

  return config;
}

function DefaultMiddleware() : Middleware[] {
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

