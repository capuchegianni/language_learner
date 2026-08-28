declare module 'passport' {
  import { RequestHandler } from 'express';

  export interface Profile {
    provider: string;
    id: string;
    displayName: string;
    name?: {
      familyName: string;
      givenName: string;
      middleName?: string;
    };
    emails?: Array<{
      value: string;
      type?: string;
    }>;
    photos?: Array<{
      value: string;
    }>;
  }

  export function initialize(options?: any): RequestHandler;
  export function session(options?: any): RequestHandler;
  export function use(strategy: any): any;
  export function use(name: string, strategy: any): any;
  export function unuse(name: string): any;
  export function authenticate(strategy: string | string[], options?: any, callback?: (...args: any[]) => any): RequestHandler;
  export function serializeUser<TUser = any, TID = any>(fn: (user: TUser, done: (err: any, id?: TID) => void) => void): void;
  export function deserializeUser<TUser = any, TID = any>(fn: (id: TID, done: (err: any, user?: TUser | false | null) => void) => void): void;

  const passport: {
    initialize: typeof initialize;
    session: typeof session;
    use: typeof use;
    unuse: typeof unuse;
    authenticate: typeof authenticate;
    serializeUser: typeof serializeUser;
    deserializeUser: typeof deserializeUser;
  };

  export default passport;
}
