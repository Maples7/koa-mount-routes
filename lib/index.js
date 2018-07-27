const assert = require('assert');
const Router = require('koa-router');
const _ = require('lodash');
const debug = require('debug');
const glob = require('glob');
const pluralize = require('pluralize');
const pkg = require('../package.json');

const debugLogger = debug(pkg.name);

module.exports = (
  app,
  dir,
  {
    ignore = '',
    urlPrefix = '/',
    autoPlural = true,
    allowedMethods = null
  } = {}
) => {
  urlPrefix = _.trimEnd(urlPrefix, '/') + '/';

  debugLogger('Mounted Routes:');

  glob.sync(`${dir}/**/*.js`, { ignore }).forEach(file => {
    const controllers = require(file);

    assert(_.isPlainObject(controllers));

    _.forOwn(controllers, (value, key) => {
      let moduleName = file.slice(file.lastIndexOf('/') + 1, -3);
      if (autoPlural) moduleName = pluralize(moduleName);

      const router = new Router();
      const prefix = `${urlPrefix}${moduleName}`;
      router.prefix(prefix);

      let handlers = value;
      if (_.isFunction(handlers)) handlers = [handlers];

      const url = `${prefix}${key}`;
      if (_.isArray(handlers)) {
        router.get(key, ...handlers);
        debugLogger(`GET - ${url}`);
      } else if (_.isPlainObject(handlers)) {
        _.forOwn(handlers, (funcs, method) => {
          if (_.isFunction(funcs)) funcs = [funcs];
          router[method](key, ...funcs);
          debugLogger(`${_.toUpper(method)} - ${url}`);
        });
      }

      app.use(router.routes());
      if (_.isPlainObject(allowedMethods)) {
        app.use(router.allowedMethods(allowedMethods));
      }
    });
  });
};
