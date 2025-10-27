// Express types that work correctly

export interface Request {
  body?: any;
  params?: any;
  query?: any;
  method?: string;
  url?: string;
  path?: string;
  originalUrl?: string;
  protocol?: string;
  header?: (name: string) => string | undefined;
  get?: (name: string) => string | undefined;
  user?: any;
}

export interface Response {
  status: (code: number) => Response;
  json: (data: any) => Response;
  send: (data: any) => Response;
  setHeader: (name: string, value: string) => void;
  req?: Request;
}

export interface NextFunction {
  (error?: any): void;
}

export interface Router {
  get: (path: string, ...handlers: any[]) => void;
  post: (path: string, ...handlers: any[]) => void;
  put: (path: string, ...handlers: any[]) => void;
  delete: (path: string, ...handlers: any[]) => void;
  patch: (path: string, ...handlers: any[]) => void;
  use: (path?: string | any, ...handlers: any[]) => void;
}

export interface Application {
  use: (path?: string | any, ...handlers: any[]) => void;
  get: (path: string, ...handlers: any[]) => void;
  post: (path: string, ...handlers: any[]) => void;
  put: (path: string, ...handlers: any[]) => void;
  delete: (path: string, ...handlers: any[]) => void;
  patch: (path: string, ...handlers: any[]) => void;
  listen: (port: number, callback?: () => void) => any;
}

// Factory function to create router
export const createRouter = (): Router => {
  const expressModule = require('express');
  return expressModule.Router() as Router;
};
