const App = require('../src/app');
const h = require('../src/helpers');

function createTestApp(scope) {
  return h.autoref(new App({
    id: 'net.maidsafe.test.javascript.id',
    name: 'JS Test',
    vendor: 'MaidSafe Ltd.',
    scope
  }));
}

function createAnonTestApp(scope) {
  const app = createTestApp(scope);
  return app.auth.connectUnregistered();
}

function createAuthenticatedTestApp(scope, access) {
  const app = createTestApp(scope);
  app.auth.loginForTest(access); // Promise, but immediate
  return app;
}

module.exports = {
  createTestApp,
  createAnonTestApp,
  createAuthenticatedTestApp
};
