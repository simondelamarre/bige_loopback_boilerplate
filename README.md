# Bige BSSDK middleware Loopback

This is a typescript API boilerplate with Bige BSSDK integrated based on LoopBack4.
a specific package will be deployed later, also you can use this boilerplate as sample API code to deploy on apim.bige.dev.

This is the list of BSSDK middleware specification :

# Get started

To begin with bige authorization you'll declare your API on apim.bige.dev and setting up a SECRET.
one you've your API setup with secret you'll define your BIGE_SECRET as environment variable.
That's all...

## Secure one endpoint

BSSDK middleware is running as interceptor with loopback, also you can secure any API endpoint by adding the following code before your endpoint handler.

#### Cheking application access authorization and retieve the current application ID

```javascript
  @intercept(toInterceptor(new bigeMiddleWare(
    "bige-app-key",
    "header",
    null
  ).chk))
```

#### Checking user connexion with specific and retrive the User ID to your endpoint handler :

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

#### CHAIN the interceptor to check different api keys

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



## Test locally with Docker

```
docker-compose up
```

## create

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

## Rebuild the project

To incrementally build the project:

```
npm run build
```

To force a full build by cleaning up cached artifacts:

```
npm run clean
npm run build
```

## Fix code style and formatting issues

If `eslint` and `prettier` are enabled for this project, you can use the
following commands to check code style and formatting issues.

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

## Other useful commands

- `npm run migrate`: Migrate database schemas for models
- `npm run openapi-spec`: Generate OpenAPI spec into a file
- `npm run docker:build`: Build a Docker image for this application
- `npm run docker:run`: Run this application inside a Docker container

## Tests

```sh
npm test
```

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
