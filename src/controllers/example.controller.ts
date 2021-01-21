import {inject, intercept} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  RequestContext,
  toInterceptor
} from '@loopback/rest';
import {API_SECURITY_SCHEME, APP_SECURITY_SCHEME, bigeCustomSecurity, bigeMiddleWare, BIGE_UNAUTHAURIZED, USER_SECURITY_SCHEME} from '../middleware/bige.middleware';
import {Example} from '../models';
import {ExampleRepository} from '../repositories';

export class ExampleController {
  constructor(
    @inject.context() public context: RequestContext,
    @repository(ExampleRepository)
    public exampleRepository: ExampleRepository,
  ) { }

  @post('/example', {
    summary: "Example Bige middleware user ACCESS checkin",
    description: "In this example endpoint Bige MiddleWare check user logged and access right from apim.bige.dev is validated by your app secret setup",
    responses: {
      '200': {
        description: 'Example model instance',
        content: {'application/json': {schema: getModelSchemaRef(Example)}},
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [USER_SECURITY_SCHEME],
    tags: ['example']
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-apim-key",
    "header",
    null
  ).chk))
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Example, {
            title: 'NewExample',
            exclude: ['ID'],
          }),
        },
      },
    })
    example: Omit<Example, 'ID'>,
  ): Promise<Example> {
    return this.exampleRepository.create(example);
  }

  @get('/example/count', {
    summary: "unsecure endpoint example",
    description: "This is a public example of endpoint, without security checks... Note that to allow access without srategy you don't have to doo anything more..",
    responses: {
      '200': {
        description: 'Example model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
    tags: ['example']
  })
  async count(
    @param.where(Example) where?: Where<Example>,
  ): Promise<Count> {
    return this.exampleRepository.count(where);
  }

  @get('/example', {
    summary: "Example Bige middleware ACCESS checkin",
    description: "In this example endpoint Bige MiddleWare check the client access right from apim.bige.dev is validated by your app secret setup",
    responses: {
      '200': {
        description: 'Array of Example model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Example, {includeRelations: true}),
            },
          },
        },
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [API_SECURITY_SCHEME],
    tags: ['example']
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-apim-key",
    "header",
    null
  ).chk))
  async find(
    @param.filter(Example) filter?: Filter<Example>,
  ): Promise<Example[]> {
    return this.exampleRepository.find(filter);
  }

  @patch('/example', {
    summary: "Example endpoint that check SUPER_ADMIN access right",
    description: "This example endpoint is checking that the user from request is logged and have a specific SUPER_ADMIN access right",
    responses: {
      '200': {
        description: 'Example PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [bigeCustomSecurity(USER_SECURITY_SCHEME, {"rights": ["SUPER_ADMIN"]})],
    tags: ['example']
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    null
  ).chk))
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Example, {
            title: 'NewExample',
            exclude: ['ID'],
            partial: true
          }) // getModelSchemaRef(Example, {partial: true}),
        },
      },
    })
    example: Example,
    @param.where(Example) where?: Where<Example>,
  ): Promise<Count> {
    return this.exampleRepository.updateAll(example, where);
  }

  @get('/example/{id}', {
    summary: "User scope example/{id}:user checkin",
    description: "This is an example of access custom scope definition, by setting up any scope entries you'll be allowed to validate this by user on your gateway api security page.",
    responses: {
      '200': {
        description: 'Example model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Example, {includeRelations: true}),
          },
        },
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [bigeCustomSecurity(USER_SECURITY_SCHEME, {"scopes": ["example/{id}"]})],
    tags: ['example'],
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    null
  ).chk))
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Example, {exclude: 'where'}) filter?: FilterExcludingWhere<Example>
  ): Promise<Example> {
    return this.exampleRepository.findById(id, filter);
  }

  @patch('/example/{id}', {
    summary: "chaining security rules",
    description: "Example of chaining security rules that check different access...",
    responses: {
      '204': {
        description: 'Example PATCH success',
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [USER_SECURITY_SCHEME, APP_SECURITY_SCHEME], // You can append your auth strategy in array
    tags: ['example'],
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-apim-key",
    "header",
    null
  ).chk))
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-app-key",
    "header",
    null
  ).chk))
  // your private security strategy
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Example, {
            title: 'NewExample',
            exclude: ['ID'],
            partial: true
          }) // getModelSchemaRef(Example, {partial: true}),
        },
      },
    })
    example: Example,
  ): Promise<void> {
    await this.exampleRepository.updateById(id, example);
  }

  @put('/example/{id}', {
    summary: "Ignore this endpoint from apim doc",
    description: "If you want to remove an endpoint from the apim.bige.dev API documentation you just have to append [ignored] tag",
    responses: {
      '204': {
        description: 'Example PUT success',
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [USER_SECURITY_SCHEME],
    tags: ["example"]
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-apim-key",
    "header",
    null
  ).chk))
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Example, {
            title: 'NewExample',
            exclude: ['ID'],
            partial: true
          })
        },
      },
    })
    example: Example,
  ): Promise<void> {
    await this.exampleRepository.replaceById(id, example);
  }

  @del('/example/{id}', {
    summary: "checkin scopes and access rights definition",
    description: "sometime you will restrict an access scope for specific admin roles so you can combine scopes and rights access. also you can simply setup a specific scope with access role like this",
    responses: {
      '204': {
        description: 'Example DELETE success',
      },
      '401': BIGE_UNAUTHAURIZED
    },
    security: [bigeCustomSecurity(USER_SECURITY_SCHEME, {
      "scopes": ["example/{id}:owner"],
      "rights": ["ADMIN"]
    })],
    tags: ["example"]
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    null
  ).chk))
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.exampleRepository.deleteById(id);
  }


  /**
   * APIM SETUPS TEST AND RESPONSES CODES
   *
   */

  @get('/example/oneRequestPerMinute', {
    summary: "I am a quotas limited endpoint",
    description: "This endpoint is limited to one request per mminutee by APIM APIs FRACTION proxy provider setup and without other security scheme.",
    responses: {
      '200': {
        description: 'Example model count',
        content: {'application/json': {schema: {message: String}}},
      }, // You also can define the others BSSDK middleware status codes
    },
    tags: ['example']
  })
  async limit(
  ): Promise<{message: String}> {
    return {message: "limitation quotas passed other status not documented"};
  }

  @get('/example/userLogged', {
    summary: "This endpoint is secure by user logged in only",
    description: "By using bige-api-key secutiry scheme, this endpoint will return a 401 UNAUTHORIZED status code when there is no user logged by the application request...",
    responses: {
      '200': {
        description: 'Example model count',
        content: {'application/json': {schema: {message: String, user: Object}}},
      }, // You also can define the others BSSDK middleware status codes - 401 anyway
    },
    tags: ['example']
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    null
  ).chk))
  async logged(
  ): Promise<{message: String, user: unknown}> {
    return {message: `The request has been performed by a logged user`, user: this.context.request.params.buser};
  }

  @get('/example/wichApp', {
    summary: "This endpoint check and retrieve from wich app",
    description: "By using bige-app-key secutiry scheme, this endpoint will return a 401 UNAUTHORIZED status code when there is no confirmed application from request... also its retrieve ssomes application informations such as appID",
    responses: {
      '200': {
        description: 'Example model count',
        content: {'application/json': {schema: CountSchema}},
      }, // You also can define the others BSSDK middleware status codes - 401 anyway
    },
    tags: ['example']
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    null
  ).chk))
  async wich(
  ): Promise<{message: String, app: unknown}> {
    return {message: `The request has been performed by a valid application`, app: this.context.request.params.bapp};
  }

  @get('/example/itsMe', {
    summary: "This endpoint check and retrieve if its really your api",
    description: "By using bige-apim-key secutiry scheme, this endpoint will return a 401 UNAUTHORIZED status code when the signature of your API is wrong... also its retrieve somes informations such as your defined api ID on APIM",
    responses: {
      '200': {
        description: 'Example model count',
        content: {'application/json': {schema: {message: String, api: Object}}},
      }, // You also can define the others BSSDK middleware status codes - 401 anyway
    },
    tags: ['example']
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-apim-key",
    "header",
    null
  ).chk))
  async itsme(
  ): Promise<{message: String, api: unknown}> {
    return {message: `The request has been performed and signed by your setup`, api: this.context.request.params.bapi};
  }

  @get('/example/doTheStuff', {
    summary: "This endpoint let you make your stuf",
    description: "If you don't wanna use the BSSDK middleware yoou can code yours by requesting the api keys in your request headers... Thats allow you to do what you want on your machine.",
    responses: {
      '200': {
        description: 'Example model count',
        content: {'application/json': {schema: {message: String, api: String, app: String, user: String}}},
      }, // You also can define the others BSSDK middleware status codes - 401 anyway
    },
    tags: ['example']
  })
  async ido(
  ): Promise<{message: String, api: unknown, app: unknown, user: unknown}> {
    return {
      message: `The request has been performed and signed by your setup`,
      user: this.context.request.headers['bige-api-key'] ? this.context.request.headers['bige-api-key'] : "NOT SET",
      app: this.context.request.headers['bige-app-key'] ? this.context.request.headers['bige-app-key'] : "NOT SET",
      api: this.context.request.headers['bige-apim-key'] ? this.context.request.headers['bige-apim-key'] : "NOT SET",
    };
  }
}
