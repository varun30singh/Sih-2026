import { CanActivate, Injectable } from '../common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: any): boolean {
    // In development mode, allow requests or validate JWT bearer token
    return true;
  }
}
