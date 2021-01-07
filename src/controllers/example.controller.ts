import {intercept} from '@loopback/core';
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
  toInterceptor
} from '@loopback/rest';
import {API_SECURITY_SCHEME, APP_SECURITY_SCHEME, bigeCustomSecurity, bigeMiddleWare, BIGE_UNAUTHAURIZED, USER_SECURITY_SCHEME} from '../middleware/bige.middleware';
import {Example} from '../models';
import {ExampleRepository} from '../repositories';

export class ExampleController {
  constructor(
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
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value: ["user", "app/{id}:owner"],
        operator: "OneOf"
      }
    }
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
    {
      rights: {
        key: "rights",
        value: ["SUPER_ADMIN"],
        operator: "OneOf"
      }
    }
  ).chk))
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Example, {partial: true}),
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
    {
      scopes: {
        key: "scopes",
        value: ["example/{id}:user"],
        operator: "In"
      }
    }
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
    "bige-api-key",
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
          schema: getModelSchemaRef(Example, {partial: true}),
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
    tags: ["example", "ignored"]
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value: ["example/{id}"],
        operator: "In"
      }
    }
  ).chk))
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() example: Example,
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
    {
      scopes: {
        key: "scopes",
        value: ["example/{id}:owner"],
        operator: "In"
      },
      rights: {
        key: "rights",
        value: ["ADMIN"],
        operator: "OneOf"
      }
    }
  ).chk))
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.exampleRepository.deleteById(id);
  }
}
