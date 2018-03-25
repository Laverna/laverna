/**
 * Test components/settings/sidebar/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import Controller from '../../../../../app/scripts/components/settings/sidebar/Controller';
/* eslint-enable */

let sand;
test('settings/sidebar/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/sidebar/Controller: channel', t => {
    t.equal(Controller.prototype.channel.channelName, 'components/settings');
    t.end();
});

test('settings/sidebar/Controller: onDestroy()', t => {
    const con  = new Controller();
    con.view   = {destroy: sand.stub(), _isDestroyed: true};
    con.navbar = {destroy: sand.stub()};
    sand.stub(con, 'stopListening');

    con.onDestroy();
    t.equal(con.stopListening.called, true, 'stops listening to events');
    t.equal(con.view.destroy.notCalled, true,
        'does nothing if the sidebar view is destroyed');

    con.view._isDestroyed = false;
    con.onDestroy();
    t.equal(con.view.destroy.called, true, 'destroyes the sidebar view');
    t.equal(con.navbar.destroy.called, true, 'destroyes the navbar view');

    sand.restore();
    t.end();
});

test('settings/sidebar/Controller: init()', t => {
    const con   = new Controller();
    con.options = {tab: null};
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    con.init();
    t.equal(con.options.tab, 'general',
        'if tab is not provided, activates "general" tab');
    t.equal(con.show.called, true, 'calls "show" method');
    t.equal(con.listenToEvents.called, true, 'starts listening to events');

    con.options.tab = 'sync';
    con.init();
    t.equal(con.options.tab, 'sync', 'if tab is provided, activates it');

    sand.restore();
    t.end();
});

test('settings/sidebar/Controller: show()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');

    con.show();
    t.equal(req.calledWith('Layout', 'show', {
        region : 'sidebar',
        view   : con.view,
    }), true, 'renders the sidebar view');

    t.equal(req.calledWith('Layout', 'show', {
        region : 'sidebarNavbar',
        view   : con.navbar,
    }), true, 'renders the navbar view');

    sand.restore();
    t.end();
});

test('settings/sidebar/Controller: listenToEvents()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    con.view     = {el: 'test'};

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.channel, 'activate:tab', con.activateTab), true,
        'listens to activate:tab event');

    sand.restore();
    t.end();
});

test('settings/sidebar/Controller: activateTab()', t => {
    const con = new Controller();
    con.view  = {activateTab: sand.stub()};

    con.activateTab({tab: 'test'});
    t.equal(con.view.activateTab.calledWith({tab: 'test'}), true,
        'triggers activate:tab event on the view');

    sand.restore();
    t.end();
});
