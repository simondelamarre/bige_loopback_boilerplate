# Bige BSSDK middleware Loopback

This is a typescript API boilerplate with Bige BSSDK integrated based on LoopBack4.
a specific package will be deployed later, also you can use this boilerplate as sample API code to deploy on apim.bige.dev.

This is the list of BSSDK middleware specification :

## Get started

We know lazy !
to launch the project (install docker) then run :

```sh
docker-compose up
```

To begin with bige authorization you'll declare your API on apim.bige.dev and setting up a SECRET.
one you've your API setup with secret you'll define your BIGE_SECRET as environment variable.
That's all...

Anyway by default you can debug locally without deploying anything by setting up BIGE_EMULATE to true as environment variable...

In this code sample the env variables is defined inside the docker-compose.yaml file :

```yaml
web:
  image: node
  command: npm start
  ports:
    - "3000:3000"
  working_dir: /src
  environment:
    BIGE_EMULATE: true
    BIGE_SECRET: BSSDK_API_ENCRYPTION_SECRET_KEY_FROM_APIM.BIGE.DEV
    PORT: 3000
  volumes:
    - ./:/src
```

For your local test and debug, BigeMiddleWare will create and return valid keys anyway with fake IDS and scopes. we'll tell about scopes later... also you can visit the documentation for more informations @ https://apim.bige.dev/documentation

## Secure one endpoint

BSSDK middleware is running as interceptor with loopback, also you can secure any API endpoint by adding the following code before your endpoint handler.

### Checking application access authorization and retieve the current application ID

```javascript
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-app-key",
    "header",
    null
  ).chk))
```

### Checking user connexion with specific and retrive the User ID to your endpoint handler :

```javascript
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value: ["user"],
        operator: "OneOf"
      }
    }
  ).chk))
```

### CHAIN the interceptor to check different api keys

```javascript
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-app-key",
    "header",
    null
  ).chk))
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value: ["user"], // Powerhead by ACCESS
        operator: "OneOf"
      },
      rights: {
        key: "rights",
        value: ["ADMIN"], // Powerhead by ACCESS
        operator: "OneOf"
      }
    }
  ).chk))
```

## Understanding APIM security and scopes

APIM gateway provide you a secure access to your API without any authorization integration.
Also you can customize any user or app access by creating your custom scopes and access rights.

The good reason to use this feature is "there is nothing to do".

While writing your API, you'll creating your OpenApi setup on each endpoint with a security scheme.
by using bigeMiddleWare the security definition can be overwritted to enable somes features params like this enxample of GET endpoint :

```typescript
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
      '401': customResponse(BIGE_UNAUTHORIZED, {scope:["myCustomScope"]})
    },
    security: secureByBige({scope:["myCustomScope/{id}"]})
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value:  ["myCustomScope"], // your first custom access scope on user
        operator: "In"
      }
    }
  ).chk))
  ping(): object {
    return {
      greeting: 'You just documented your first api custom scope on Users',
    };
  }
```

By receiving your openApi documentation, APIM will find "myCustomScope" on a bige-api-key and by the way you'll be able to activate or disable this scope on any user that consume your API in the API users management page.

### Experimental feature scope of access rights

One of the nice feature of ou MiddleWare is to allow your to variabilize your scopes with params persing,
for example, you want to setting up an access right on a specific endpoint to a specikfic user :

```typescript
  @get('/endpooint/{id}', {
    responses: {
      '200': PING_RESPONSE,
      '401': customResponse(BIGE_UNAUTHORIZED, {scope:["myCustomScope/{id}"]}),
    },
    security: secureByBige({scope:["myCustomScope/{id}"]})
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value:  ["myCustomScope/{id}"], // your first custom access scope on user
        operator: "In"
      }
    }
  ).chk))
  endpointHandler(
    @param({
      name: 'name',
      description: 'a sample param name.',
      in: 'path',
      required: true,
      schema: {type: 'string'},
    }) name: String,
  ): object {
    return {
      greeting: `Only users who have the myCustomScope/${id} access right can receive this greeting`,
    };
  }
```

### Already have anauthentication in my API

APIM can use your authentication with a default API access setup such as :

- oauth1
- oauth2
- Bearer token
- Basic auth
- HAWK
- AWS
- Akamai

You can easily setup and manage your API uthentication on your API privacy setup page.
Also any signature will not be able to manage your users dependently to ACCESS by bige.
We recommand you to bypass your authentication while your api requests are coming from APIM to ensure the delivrability.
Considere that APIM will be a single signature for any, also you can easily chain your authentication with our middleware like :

```javascript
  @get('/endpooint/{id}', {
    responses: {
      '200': PING_RESPONSE,
      '401': YOUR_AUTH_REESPONSE,
    },
    security: [
      YOUR_OAS_SECURITY_STRATEGY_SCHEME, // one of listed before or custom header with a custom api key name
      customResponse(BIGE_UNAUTHORIZED, {scope:["myCustomScope/{id}"]})
    ]
  })
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-api-key",
    "header",
    {
      scopes: {
        key: "scopes",
        value:  ["myCustomScope/{id}"], // your first custom access scope on user
        operator: "In"
      }
    }
  ).chk))
  @authenticate('yourApiAuthStrategy')
  endpointHandler(
    @param({
      name: 'name',
      description: 'a sample param name.',
      in: 'path',
      required: true,
      schema: {type: 'string'},
    }) name: String,
  ): object {
    return {
      greeting: `Only users who have the myCustomScope/${id} access right can receive this greeting`,
    };
  }
```

By chaining our MiddleWare with youur authentication strategy you ensure your proper security and geet the benefits of any Bige MiddleWare strategy over your also you assume that your security scheme will not correspond to the APIM documentation so anyway you have to define a security schemes Array who combine your Strategy with some of bige strategies.


## PROJECT FRST RUN

We etablish somes basics uses from loopback to help you to get started...

### Test locally with Docker

```sh
docker-compose up
```

### Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

### Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

### Rebuild the project

To incrementally build the project:

```
npm run build
```

To force a full build by cleaning up cached artifacts:

```
npm run clean
npm run build
```

### Fix code style and formatting issues

If `eslint` and `prettier` are enabled for this project, you can use the
following commands to check code style and formatting issues.

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

### Other useful commands

- `npm run migrate`: Migrate database schemas for models
- `npm run openapi-spec`: Generate OpenAPI spec into a file
- `npm run docker:build`: Build a Docker image for this application
- `npm run docker:run`: Run this application inside a Docker container

### Tests

```sh
npm test
```

### About Loopback Framework

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to your APIM API setup.
