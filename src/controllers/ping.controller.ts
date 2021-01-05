import {inject, intercept} from '@loopback/core';
import {get, param, Request, ResponseObject, RestBindings, toInterceptor} from '@loopback/rest';
import {bigeMiddleWare} from '../middleware/bige.middleware';
// eslint-disable-next-line @typescript-eslint/no-misused-promises
// const bigeInterceptor = toInterceptor(bigeMiddleWare);

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) { }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value: ["user", "app/{id}:owner"],
        operator: "OneOf"
      },
      rights: {
        key: "rights",
        value: ["SUPER_ADMIN"],
        operator: "OneOf"
      }
    }
  ).chk))
  ping(
    @param({
      name: 'name',
      description: 'a sample param name.',
      in: 'query',
      required: true,
      schema: {type: 'string'},
    }) name: String,
  ): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      name: name,
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  @get('/noauth', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  noauth(
    @param({
      name: 'name',
      description: 'a sample param name.',
      in: 'query',
      required: true,
      schema: {type: 'string'},
    }) name: String,
  ): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      name: name,
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}// Bind options and provider for `NameValidator`

