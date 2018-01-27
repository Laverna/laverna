/**
 * Test components/notebooks/Router.js
 * @file
 */
import test from 'tape';

import Router from '../../../../app/scripts/components/notebooks/Router.js';
import controller from '../../../../app/scripts/components/notebooks/controller.js';

test('notebooks/Router: controller', t => {
    t.equal(typeof Router.prototype.controller, 'object',
        'is an object');
    t.equal(Router.prototype.controller, controller, 'uses the correct controller');
    t.end();
});

test('notebooks/Router: appRoutes', t => {
    const routes = Router.prototype.appRoutes;
    t.equal(typeof routes, 'object', 'is an object');

    t.equal(routes['notebooks'], 'showList',
        'shows a list of notebooks and tags');
    t.equal(routes['notebooks/add'], 'notebookForm',
        'shows notebook add form');
    t.equal(routes['notebooks/edit/:id'], 'notebookForm',
        'shows notebook edit form');
    t.equal(routes['tags/add'], 'tagForm',
        'shows tag add form');
    t.equal(routes['tags/edit/:id'], 'tagForm',
        'shows tag edit form');

    t.end();
});
