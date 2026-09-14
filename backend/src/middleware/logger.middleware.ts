import { Injectable, NestMiddleware } from '../common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [MandiSetu-API] ${req.method || 'GET'} ${req.url || '/'}`);
    if (next) next();
  }
}
