import { BaseModule } from '@modern-mean/server-base-module';
import * as express from 'express';

export interface MiddlewareManagerInterface {
  add(middleware: Middleware[]): Promise<void>,
  enable(target: express.Router | express.Application, priority: number): Promise<void | string>,
  get(filter?: string): Middleware[]
}

export interface Middleware {
  enable: boolean,
  name: string,
  priority: number,
  middleware: express.RequestHandler,
  enabled?: boolean
}

export class MiddlewareManager extends BaseModule implements MiddlewareManagerInterface {

  protected middleware: Middleware[];

  constructor() {

    super();

    this.middleware = [];

  }

  add(middleware: Middleware[]): Promise<void> {
    return new Promise((resolve, reject) => {
      middleware.forEach(item => {
        let current = this.get(item.name);
        if (current.length === 1) {
          this.middleware[this.middleware.indexOf(current[0])] = item;
        } else {
          this.middleware.push(item);
        }
      });

      return resolve();
    });
  }

  enable(target: express.Router | express.Application, priority: number = 0): Promise<void | Error> {
    return new Promise((resolve, reject) => {
      try {
        this.middleware
          .filter(item => item.priority >= priority)
          .filter(item => item.enable)
          .filter(item => !item.enabled)
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
            target.use(item.middleware);
            item.enabled = true;
          });
        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  get(filter?: string): Middleware[] {
    if (filter) {
      return this.middleware.filter(item => item.name === filter);
    }
    return this.middleware;
  }

  create(name: string, priority: number, middleware): Middleware {
    return {
      enable: true,
      name: name,
      priority: priority,
      enabled: false,
      middleware: middleware
    };
  }

  remove(filter?: string): Middleware[] {
    let find = this.middleware
      .filter(item => item.name === filter);
    return this.middleware.splice(this.middleware.indexOf(find[0]), 1);
  }

}
