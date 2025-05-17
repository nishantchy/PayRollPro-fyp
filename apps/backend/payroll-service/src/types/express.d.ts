import { Request, Response } from "express";
import { Express } from "express";

declare namespace Express {
  export interface Multer {
    File: MulterFile;
  }
  export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }
  export interface RequestHandler {
    (req: Request, res: Response, next: Function): any;
  }
  interface User {
    id: string;
    role?: string;
    customer_id?: string;
    organization_id?: string;
    email?: string;
    name?: string;
  }
}

declare module "express-serve-static-core" {
  interface Router {
    get(path: PathParams, ...handlers: any[]): this;
    post(path: PathParams, ...handlers: any[]): this;
    put(path: PathParams, ...handlers: any[]): this;
    delete(path: PathParams, ...handlers: any[]): this;
    use(...handlers: any[]): this;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      role?: string;
      customer_id?: string;
      organization_id?: string;
      email?: string;
      name?: string;
    }
  }
}
