# koa-mount-routes

[![Build Status](https://travis-ci.org/Maples7/koa-mount-routes.svg?branch=master)](https://travis-ci.org/Maples7/koa-mount-routes)
[![Coverage Status](https://coveralls.io/repos/github/Maples7/koa-mount-routes/badge.svg?branch=master)](https://coveralls.io/github/Maples7/koa-mount-routes?branch=master)

[![NPM](https://nodei.co/npm/koa-mount-routes.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/koa-mount-routes/)

A koa package to load routes automatically from file system.

## Why?

- Avoid multiple router definition codes
- Reduce check point with auto-defined routes while debugging
- [CoC(Configuration over Convention)](https://en.wikipedia.org/wiki/Convention_over_configuration)

## Usage

After `yarn add koa-mount-routes` or `npm install koa-mount-routes --save`:

```js
const path = require('path');
const Koa = require('koa');
const mountRoutes = require('koa-mount-routes');

const app = new Koa();
mountRoutes(app, path.join(__dirname, 'controllers'), {
  urlPrefix: '/api/v1/'
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
```

### API Doc

```js
mountRoutes(
  app, // A Koa2 instance;
  dirPath, // *absolute* path to the controllers dir
  {
    // optional parameters, and the 3rd param for this function is not required
    ignore, // files you want to ignore while scanning controllers dir such as index.js, see parameter options of module glob(https://github.com/isaacs/node-glob#options) for more infomation. Default value: ''
    urlPrefix, // prefix for routes, such as /api/v1/. Default value: '/'
    autoPlural, // whether apply pluralized file name as part of routes automatically. Default value: true
    allowedMethods // it is for koa-router, see https://github.com/alexmingoia/koa-router#routerallowedmethodsoptions--function for more information. As here, you can assign it to `[options]` parameter of koa-router#router.allowedMethods such as `{ throw: true }`. Default value: null, that's to say, we do not execute `app.use(router.allowedMethods());` by default.
  }
);
```

### How to write Controllers

You must export an object whose keys are last part of routes and values are objects (or array) with HTTP method and handlers. For example:

```js
// FileName: controllers/weibo.js

module.exports = {
  // when value is a function or an array of functions, the HTTP method would be default value GET
  '/': async ctx => {
    ctx.body = 'Weibos Index';
  },
  // also you can provide one more handlers with an array of functions: these handlers except last one are called middlerwares in Koa
  '/getArr': [
    async ctx => {
      ctx.body = 'GET for one more handlers';
    }
  ],
  // also you can make URL params
  '/:id': {
    // explicitly identifing an HTTP method can never be wrong
    get: ctx => {
      ctx.body = `get weibo: ${ctx.params.id}`;
    },
    post: async ctx => {
      ctx.body = `post weibo: ${ctx.params.id}`;
    }
  },
  // another example for usage of middlerwares
  '/temp': {
    delete: [
      async (ctx, next) => {
        ctx.myOwnVar = 'this is a middleware.';
        await next();
      },
      async ctx => {
        ctx.body = `${ctx.myOwnVar}ordinary api`;
      }
    ]
  }
};
```

At last, routes would be combined with `${urlPrefix} + ${pluralized file name of controllers} + ${identified keys}`. Therefore, examples above would mount these routes:

```txt
GET - /api/v1/weibos/
GET - /api/v1/weibos/getArr
GET - /api/v1/weibos/:id
POST - /api/v1/weibos/:id
DELETE - /api/v1/weibos/temp
```

You are welcomed to review _test.js_ and _controllers_ dir in this project for more information of usage.

## Attention

1. As Koa does not provide a router by default, we pick [koa-router](https://github.com/alexmingoia/koa-router) as the router.

2. You can use `DEBUG=koa-mount-routes` to get to know what routes are mounted.

## Relatives

- [koa-final-response](https://github.com/Maples7/koa-final-response)
- [express-mount-routes](https://github.com/Maples7/express-mount-routes)
- [express-final-response](https://github.com/Maples7/express-final-response)

## LICENSE

[MIT](LICENSE)
