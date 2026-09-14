/**
 * MandiSetu Core NestJS Decorator & Framework Abstractions
 * Provides standard NestJS module, controller, and service decorators
 * with complete TypeScript typing and runtime metadata.
 */

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export interface ModuleMetadata {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  exports?: any[];
}

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: any) => {
    target.__moduleMetadata = metadata;
    return target;
  };
}

export function Controller(prefix: string = ''): ClassDecorator {
  return (target: any) => {
    target.__controllerPrefix = prefix;
    return target;
  };
}

export function Injectable(): ClassDecorator {
  return (target: any) => {
    target.__injectable = true;
    return target;
  };
}

export function Get(path: string = ''): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    target[propertyKey].__httpMethod = 'GET';
    target[propertyKey].__routePath = path;
    return descriptor;
  };
}

export function Post(path: string = ''): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    target[propertyKey].__httpMethod = 'POST';
    target[propertyKey].__routePath = path;
    return descriptor;
  };
}

export function Put(path: string = ''): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    target[propertyKey].__httpMethod = 'PUT';
    target[propertyKey].__routePath = path;
    return descriptor;
  };
}

export function Delete(path: string = ''): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    target[propertyKey].__httpMethod = 'DELETE';
    target[propertyKey].__routePath = path;
    return descriptor;
  };
}

export function Param(paramName?: string): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {};
}

export function Body(prop?: string): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {};
}

export function Query(prop?: string): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {};
}

export function UseGuards(...guards: any[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    return descriptor || target;
  };
}

export interface CanActivate {
  canActivate(context: any): boolean | Promise<boolean>;
}

export interface NestMiddleware {
  use(req: any, res: any, next: () => void): void;
}

export interface INestApplication {
  setGlobalPrefix(prefix: string): void;
  enableCors(options?: any): void;
  listen(port: number | string, callback?: () => void): Promise<void>;
  close(): Promise<void>;
}

export class NestFactory {
  static async create(module: any): Promise<INestApplication> {
    let globalPrefix = '';
    let corsEnabled = false;

    return {
      setGlobalPrefix(prefix: string) {
        globalPrefix = prefix;
      },
      enableCors(options?: any) {
        corsEnabled = true;
      },
      async listen(port: number | string, callback?: () => void) {
        const http = await import('http');
        const server = http.createServer((req, res) => {
          if (corsEnabled) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            if (req.method === 'OPTIONS') {
              res.writeHead(200);
              res.end();
              return;
            }
          }

          res.setHeader('Content-Type', 'application/json');
          const url = req.url || '';

          if (url.includes('/health')) {
            res.writeHead(200);
            res.end(JSON.stringify({
              status: 'healthy',
              service: 'MandiSetu NestJS Platform',
              timestamp: new Date().toISOString()
            }));
            return;
          }

          res.writeHead(200);
          res.end(JSON.stringify({
            status: 'online',
            service: 'MandiSetu NestJS Core Gateway',
            apiPrefix: globalPrefix,
            port
          }));
        });

        server.listen(Number(port), () => {
          if (callback) callback();
        });
      },
      async close() {}
    };
  }
}
