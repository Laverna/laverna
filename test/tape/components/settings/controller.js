/**
 * Test components/settings/controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import controller from '../../../../app/scripts/components/settings/controller';
import Sidebar from '../../../../app/scripts/components/settings/sidebar/Controller';
import Show from '../../../../app/scripts/components/settings/show/Controller';
/* eslint-enable */

let sand;
test('settings/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/Controller: showSidebar()', t => {
    const init = sand.stub(Sidebar.prototype, 'init');
    const once = sand.stub(Sidebar.prototype, 'once');

    controller.sidebar = {};
    controller.showSidebar();
    t.equal(init.notCalled, true, 'does nothing if the sidebar is shown');

    controller.sidebar = null;
    controller.showSidebar();
    t.equal(typeof controller.sidebar, 'object', 'creates "sidebar" property');
    t.equal(init.called, true, 'instantiates the sidebar controller');
    t.equal(once.calledWith('destroy'), true, 'listens to "destroy" event');

    sand.restore();
    t.end();
});

test('settings/Controller: showContent()', t => {
    sand.stub(controller, 'showSidebar');
    const init = sand.stub(Show.prototype, 'init');
    const once = sand.stub(Show.prototype, 'once');

    const opt = {tab: 'general'};
    controller.showContent(opt.tab);

    t.equal(controller.showSidebar.calledWith(opt), true, 'shows the sidebar');
    t.equal(init.called, true, 'instantiates the content controller');
    t.equal(once.calledWith('destroy'), true, 'listesn to "destroy" event');

    sand.restore();
    t.end();
});

test('settings/Controller: onDestroy()', t => {
    const req = sand.stub(Radio, 'request').returns('settings');

    controller.onDestroy();
    t.equal(req.calledWith('utils/Url', 'getHash'), true,
        'makes "getHash" request');

    req.returns('notes');
    const destroySidebar = sand.stub();
    const destroyContent = sand.stub();
    controller.sidebar = {destroy: destroySidebar};
    controller.content = {destroy: destroyContent};

    controller.onDestroy();
    t.equal(destroySidebar.called, true, 'destroyes the sidebar controller');
    t.equal(destroyContent.called, true, 'destroyes the content controller');
    t.equal(controller.sidebar, null, 'removes sidebar property');
    t.equal(controller.content, null, 'removes content property');

    controller.onDestroy();

    sand.restore();
    t.end();
});
