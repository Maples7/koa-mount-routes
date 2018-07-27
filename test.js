const http = require('http');
const path = require('path');
const test = require('ava');
const Boom = require('boom');
const Koa = require('koa');
const request = require('supertest');
const mountRoutes = require('./index');

function makeApp() {
  const app = new Koa();
  mountRoutes(app, path.join(__dirname, 'controllers'), {
    urlPrefix: '/api/v1/'
  });
  return http.createServer(app.callback());
}

function makeApp2() {
  const app = new Koa();
  mountRoutes(app, path.join(__dirname, 'controllers'), {
    urlPrefix: '/api/v1',
    autoPlural: false,
    allowedMethods: {
      throw: true,
      notImplemented: () => {
        throw Boom.notImplemented(
          'HTTP method for this API is not implemented'
        );
      },
      methodNotAllowed: () => {
        throw Boom.methodNotAllowed('HTTP method for this API is not allowed');
      }
    }
  });
  return http.createServer(app.callback());
}

test('GET /api/v1/weibos/', async t => {
  t.plan(2);

  const res = await request(makeApp()).get('/api/v1/weibos/');

  t.is(res.status, 200);
  t.is(res.text, 'Weibos Index');
});

test('GET /api/v1/weibos/getArr', async t => {
  t.plan(2);

  const res = await request(makeApp()).get('/api/v1/weibos/getArr');

  t.is(res.status, 200);
  t.is(res.text, 'GET for one more handlers');
});

test('GET /api/v1/weibos/:id', async t => {
  t.plan(2);

  const res = await request(makeApp2()).get('/api/v1/weibo/7');

  t.is(res.status, 200);
  t.is(res.text, 'get weibo: 7');
});

test('POST /api/v1/weibos/:id', async t => {
  t.plan(2);

  const res = await request(makeApp()).post('/api/v1/weibos/6');

  t.is(res.status, 200);
  t.is(res.text, 'post weibo: 6');
});

test('DELETE /api/v1/weibos/temp', async t => {
  t.plan(2);

  const res = await request(makeApp()).delete('/api/v1/weibos/temp');

  t.is(res.status, 200);
  t.is(res.text, 'this is a middleware.ordinary api');
});

test('GET /api/v1/users/test', async t => {
  t.plan(2);

  const res = await request(makeApp()).get('/api/v1/users/test');

  t.is(res.status, 200);
  t.is(res.text, '2rd controller');
});
