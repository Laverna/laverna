/**
 * Test components/settings/controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import controller from '../../../../app/scripts/components/settings/controller';
import Sidebar from '../../../../app/scripts/components/settings/sidebar/Controller';
/* eslint-enable */

let sand;
test('settings/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/Controller: showSidebar()', t => {
    const init = sand.stub(Sidebar.prototype, 'init');

    controller.sidebar = {};
    controller.showSidebar();
    t.equal(init.notCalled, true, 'does nothing if the sidebar is shown');

    controller.sidebar = null;
    controller.showSidebar();
    t.equal(typeof controller.sidebar, 'object', 'creates "sidebar" property');
    t.equal(init.called, true, 'instantiates the sidebar controller');

    sand.restore();
    t.end();
});

test('settings/Controller: showContent()', t => {
    sand.stub(controller, 'showSidebar');
    const opt = {profileId: 'test', tab: 'general'};

    controller.showContent(opt.profileId, opt.tab);
    t.equal(controller.showSidebar.calledWith(opt), true,
        'shows the sidebar');

    sand.restore();
    t.end();
});

test('settings/Controller: onContentDestroy()', t => {
    t.end();
});
