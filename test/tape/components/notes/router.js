/**
 * Test the core app: components/notes/Router.js
 * @file
 */
import test from 'tape';

import Router from '../../../../app/scripts/components/notes/Router.js';
import controller from '../../../../app/scripts/components/notes/controller.js';

test('notes/Router: controller()', t => {
    t.equal(typeof Router.prototype.controller, 'object',
        'is an object');
    t.equal(Router.prototype.controller, controller, 'uses the correct controller');
    t.end();
});

test('notes/Router: appRoutes', t => {
    const routes = Router.prototype.appRoutes;
    t.equal(typeof routes, 'object', 'is an object');
    t.equal(routes['(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)'], 'showNotes',
        'properly computes routes');
    t.end();
});
