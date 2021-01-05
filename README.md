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

### Secure one endpoint with our middleware

The first usecase if to secure your endpoint from APIM proxy authorization strategy.
So from apim, this first usecase only retrieve a 401 unauthorized by default without any call on your API.
note that any endpoint that integrate this middleware only catch any that trying to consume without prior apim ACCESS validation. So if you just wanna private a endpoint access tip this :

```javascript
  @intercept(toInterceptor(new bigeMiddleWare().chk))
```


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
    security: secureByBige(BIGE_API_STRATEGY, {scope:["myCustomScope/{id}"]})
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
  @get('/endpoint/{id}', {
    responses: {
      '200': PING_RESPONSE,
      '401': customResponse(BIGE_UNAUTHORIZED, {scope:["myCustomScope/{id}"]}),
    },
    security: secureByBige(BIGE_API_STRATEGY, {scope:["myCustomScope/{id}"]})
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
  @get('/endpoint/{id}', {
    responses: {
      '200': PING_RESPONSE,
      '401': YOUR_AUTH_REESPONSE,
    },
    security: [
      YOUR_OAS_SECURITY_STRATEGY_SCHEME, // one of listed before or custom header with a custom api key name
      secureByBige(BIGE_API_STRATEGY, {scope:["myCustomScope/{id}"]})
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

## Retrieve dataset in your handler

By using our MiddleWare, you'll be able to retrieve somes precious informations directly in youur endpoint Handler such as Application ID, user ID or api ID (...)

This is a sample Handler that retrieve an app Key and an user Key with IDs :

```typescript
  @get('/endpoint/',
  {
    summary:"a sample endpoint",
    description:"this endpoint is secured by app and logged user strategies",
    responses: {
      '200': ENDPOINT_RESPONSE, // think about sample and description to get better documentation on APIM
      '401': BIGE_UNAUTHORIZED,
    },
    security: [
      secureByBige(BIGE_API_STRATEGY, {scope:["myCustomScope/{id}"]})
      BIGE_APP_STRATEGY
    ]
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
  endpointHandler(): {appID: Number, userID: Number} {
    // you can perform anything you want with userID and appID
    return {
      userID: this.context.request.buser.ID,
      appID: this.context.request.bapp.ID
    };
  }
```

### Secure your API access to authorized apps and users without other needs

Sometime and to go fast you don't need any analyse but only a secure access right!
this is our first usecase ;-)
But to secure any api endpoint you'll modifying your master sequence file by adding this line before any handler:

```javascript
import BSSDK from './lib/bigeSSDK'; // first import the yarn and npm package is coming soon...
BSSDK() // then add this in your sequence before any handler
```


## Advantage of LoopBack

Bige've choosed loopback to make our first nodejjs API boilerplate for good reasons!

- loopback offer a cli that ensure that your OAS doc feel good
- loopback structure is relatively complete and elegant
- the architecture ensure that you are concentrated on your tasks.
- and more also thats somes cli command to help you to get started

### create a datasource

Loopback datasource allow you to integrate and migrate your models from a DB to another one...
thats probably the first thing you wanna do with your API so with the command below you can create datasources for POSTRGRES, MONGO, MYSQL, REDIS, ORACLE, SOAP and a lot more...

```sh
lb4 datasource // then follow command
```

### create a model

One of the first thing that make Nodejs API wrong is typed models.
Also lb4 help you to make it faster and better, also you'll modifying it directly cause somes of types and formats depends of your datasource choice...

```sh
lb4 model // and follow command...
```

### create a repository

As you know, to bind any model to any controller you'll need a repo...
So to write less code just tip this CLI command to get your first repo :

```sh
lb4 repository // select your model and datasource then follow the command...
```

### And the almost usecase with loopback CREATE YOUR ENDPOINTS CONTROLLERS

We know that somes api only need endpoints with another proxy to secure your local/private IT and make your data readable under your walls...

So to create a repo you don't need anything more that this command line :

```sh
lb4 controller // then follow from your needs...
```

## ALL you need is product

Anyway after this install, you'll be able to deploy your API on APIM.BIGE.DEV and without any kind of problems or difficulty.

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
