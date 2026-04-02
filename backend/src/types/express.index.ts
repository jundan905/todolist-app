import { JwtPayload } from './auth.types';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export {};
