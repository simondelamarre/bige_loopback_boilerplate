import {ExpressRequestHandler, HttpErrors} from '@loopback/rest';

export declare type CompareItems = {
  key: string;
  operator: Operators | string;
  value?: string | string[];
}

export declare enum Operators {
  In,
  Nin,
  Eq,
  Neq,
  OneOf,
  Like,
  Ilike,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export class bigeMiddleWare {
  private check: {[key: string]: string | CompareItems;};
  private keyName: string;
  private in: string;
  private secret?: string = process.env.BIGE_SECRET;
  constructor(keyName: string, wherein: string, check: {[key: string]: string | CompareItems;}) {
    this.keyName = keyName;
    this.in = wherein;
    this.check = check;
  }
  // console.log(scopes)
  public chk: ExpressRequestHandler = (request, response, next) => {
    // const {request} = middlewareCtx;
    console.log('scopes ', this.check)
    console.log('keyName ', this.keyName)
    console.log('whereIn ', this.in)
    console.log('secret ', this.secret)
    // console.log('Request: %s %s', request.method, request);
    try {
      // console.log('CALLING BIGE MIDDLEWARE ', request.method, request.headers, request.headers);
      // Proceed with next middleware
      next();
      // Process response
      /* console.log(
        'Response received for %s %s',
        request.method,
        request.originalUrl,
      );
      return result; */
    } catch (err) {
      // Catch errors from downstream middleware
      console.error(
        'Error received for %s %s',
        request.method
      );
      throw new HttpErrors.Unauthorized('UNAUTHORIZED - by bige');
    }
  }
}


// app.middleware(bige);
