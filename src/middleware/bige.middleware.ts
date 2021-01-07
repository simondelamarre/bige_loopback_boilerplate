import {ExpressRequestHandler, HttpErrors, SecurityRequirementObject} from '@loopback/rest';
const JWT = require('jsonwebtoken');

export declare type CompareItems = {
  key: string;
  operator: Operators | string;
  value: string[] | string;
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
  private check: {[key: string]: CompareItems};
  private keyName: string;
  private in: string;
  private secret?: string = process.env.BIGE_SECRET;
  constructor(keyName: string, wherein: string, check: {[key: string]: CompareItems} | null) {
    this.keyName = keyName;
    this.in = wherein;
    if (check)
      this.check = check;
  }
  public chk: ExpressRequestHandler = (request, response, next) => {
    try {
      const token = request.headers[this.keyName];
      const decrypt = JWT.verify(token, this.secret);
      if (this.check) {
        for (const key of Object.keys(this.check)) {
          if (!decrypt[key].key)
            throw new HttpErrors.Unauthorized(`UNAUTHORIZED - access ${key}`)
          else {
            if (!this.validate(decrypt, key))
              throw new HttpErrors.Unauthorized(`UNAUTHORIZED - access ${this.check[key]}`)
          }
        }
      }
      if (decrypt)
        return next();
    } catch (err) {
      throw new HttpErrors.Unauthorized('UNAUTHORIZED - by bige');
    }
  }
  private validate = (entry: {[key: string]: string | string[]}, key: string) => {
    if (!entry.key)
      throw new HttpErrors.Unauthorized(`UNAUTHORIZED - ${key}`)
    switch (this.check[key].operator) {
      case 'In':
        if (Array.isArray(this.check[key].value))
          for (const val of this.check[key].value) {
            if (!entry[key].includes(val)) {
              throw new HttpErrors.Unauthorized(`UNAUTHORIZED - In ${val}`)
            }
          }
        else if (entry[key].indexOf(this.check[key].value as string) === -1)
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - In ${key}`)
        break;
      case 'Nin':
        if (Array.isArray(this.check[key].value))
          for (const val of this.check[key].value) {
            if (!entry[key].includes(val)) {
              throw new HttpErrors.Unauthorized(`UNAUTHORIZED - ${val}`)
            }
          }
        else if (entry[key].indexOf(this.check[key].value as string) !== -1)
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Not in ${key}`)
        break;
      case 'Eq':
        if (this.check[key].value !== entry[key])
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Equal ${key}`)
        break;
      case 'Neq':
        if (this.check[key].value !== entry[key])
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Not Equal ${key}`)
        break;
      case 'OneOf':
        if (Array.isArray(this.check[key].value) && Array.isArray(entry[key])) {
          const test = entry[key] as string[];
          const en = this.check[key].value as string[];
          if (!test.some((set: string) => en.indexOf(set) >= 0)) {
            throw new HttpErrors.Unauthorized(`UNAUTHORIZED - One of ${this.check[key].value}`)
          }
        } else {
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Api setup type error ${key}`)
        }
        break;
      case 'Like':
        if (typeof this.check[key].value === "string" && typeof entry[key] === "string") {
          const test = entry[key] as string;
          const en = this.check[key].value as string;
          if (test.toLowerCase().indexOf(en.toLowerCase()) === -1)
            throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Like ${en}`)
        } else {
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Api setup type error ${key}`)
        }
        break;
      case 'Ilike':
        if (typeof this.check[key].value === "string" && typeof entry[key] === "string") {
          const test = entry[key] as string;
          const en = this.check[key].value as string;
          if (test.toLowerCase().indexOf(en.toLowerCase()) === -1)
            throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Like ${en}`)
        } else {
          throw new HttpErrors.Unauthorized(`UNAUTHORIZED - Api setup type error ${key}`)
        }
        break;
    }
    return true;
  }
}

export const BIGE_UNAUTHAURIZED = {
  description: 'UNAUTHORIZED, received an unvalidated access Key',
  content: {
    'application/json': {
      schema: {
        "type": Object,
        "title": "unauthorized.access",
        "properties": {
          "statusCode": {
            "type": Number
          },
          "error": {
            "type": Object,
            "properties": {
              "message": {
                "type": String
              }
            }
          }
        }
      }
    }
  }
}

export const API_SECURITY_SCHEME =
{
  "type": ["apiKey"],
  "in": ["header"],
  "bearerFormat": ["JWT"],
  "name": ["bige-apim-key"],
};

export const APP_SECURITY_SCHEME =
{
  "type": ["apiKey"],
  "in": ["header"],
  "bearerFormat": ["JWT"],
  "name": ["bige-app-key"],
  "scopes": [],
  "rights": []
};

export const USER_SECURITY_SCHEME =
{
  "type": ["apiKey"],
  "in": ["header"],
  "bearerFormat": ["JWT"],
  "name": ["bige-api-key"],
};

export const bigeCustomSecurity = (entry: {[key: string]: string[] | string}, options: {[key: string]: string[] | string}): SecurityRequirementObject => {
  const response = entry as {[key: string]: string[] | string};
  if (options.scopes) response.scopes = options.scopes;
  if (options.rights) response.rights = options.rights;
  return response as SecurityRequirementObject;
}
