/**
 * Test: components/settings/Router.js
 * @file
 */
import test from 'tape';

import Router from '../../../../app/scripts/components/settings/Router.js';
import controller from '../../../../app/scripts/components/settings/controller.js';

test('settings/Router: controller()', t => {
    t.equal(typeof Router.prototype.controller, 'object', 'is an object');
    t.equal(Router.prototype.controller, controller, 'uses the correct controller');
    t.end();
});

test('settings/Router: appRoutes', t => {
    const routes = Router.prototype.appRoutes;
    t.equal(typeof routes, 'object', 'is an object');
    t.equal(routes['settings(/:tab)'], 'showContent');
    t.end();
});
