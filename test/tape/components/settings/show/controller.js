/**
 * Test components/settings/show/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import Controller from '../../../../../app/scripts/components/settings/show/Controller';
/* eslint-enable */

let sand;
test('settings/show/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/Controller: views', t => {
    const views = Controller.prototype.views;
    t.equal(typeof views, 'object');
    t.end();
});

test('settings/show/Controller: channel', t => {
    t.equal(Controller.prototype.channel.channelName, 'components/settings');
    t.end();
});

test('settings/show/Controller: configsChannel', t => {
    t.equal(Controller.prototype.configsChannel.channelName, 'collections/Configs');
    t.end();
});

test('settings/show/Controller: constructor()', t => {
    const con = new Controller();
    t.equal(typeof con.changes, 'object', 'creates "changes" property');
    t.end();
});

test('settings/show/Controller: onDestroy()', t => {
    const con = new Controller();
    con.view  = {_isDestroyed: true, destroy: sand.stub()};
    sand.stub(con, 'stopListening');
    sand.stub(con.channel, 'stopReplying');

    con.onDestroy();
    t.equal(con.stopListening.called, true, 'stops listening to events');
    t.equal(con.channel.stopReplying.called, true, 'stops replying to events');
    t.equal(con.view.destroy.notCalled, true,
        'does not destroy the view if it is destroyed');

    con.view._isDestroyed = false;
    con.onDestroy();
    t.equal(con.view.destroy.called, true, 'destroyes the view');

    sand.restore();
    t.end();
});

test('settings/show/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'fetch').returns(Promise.resolve([1, 2]));
    sand.stub(con, 'show');
    sand.stub(con, 'listenToEvents');

    con.init()
    .then(() => {
        t.equal(con.options.tab, 'general', '"general" tab is active by default');
        t.equal(con.fetch.called, true, 'fetches configs');
        t.equal(con.show.calledWith([1, 2]), true, 'renders the view');
        t.equal(con.listenToEvents.called, true, 'starts listening to events');

        sand.restore();
        t.end();
    });
});

test('settings/show/Controller: fetch()', t => {
    const con    = new Controller({profileId: 'test'});
    const req    = sand.stub(con.configsChannel, 'request');
    const radReq = sand.stub(Radio, 'request');

    const res    = con.fetch();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(req.calledWith('find'), true, 'fetches configs collection');

    t.equal(radReq.calledWith('collections/Users', 'find'),
        true, 'fetches users');

    sand.restore();
    t.end();
});

test('settings/show/Controller: show()', t => {
    const con  = new Controller({tab: 'general'});
    const req  = sand.stub(Radio, 'request');
    const trig = sand.stub(con.channel, 'trigger');

    con.show(['collection', 'useDefault', 'profiles']);
    t.equal(req.calledWith('Layout', 'show', {
        region : 'content',
        view   : con.view,
    }), true, 'renders the view in "content" region');

    t.equal(trig.calledWith('activate:tab', con.options), true,
        'triggers activate:tab event on the channel');

    sand.restore();
    t.end();
});

test('settings/show/Controller: listenToEvents()', t => {
    const con    = new Controller({tab: 'general'});
    const listen = sand.stub(con, 'listenTo');
    const reply  = sand.stub(con.channel, 'reply');
    con.view     = {tabView: {}, el: 'test'};

    con.listenToEvents();
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');
    t.equal(listen.calledWith(con.view, 'save', con.save), true,
        'saves changes if the view triggers "save" event');
    t.equal(listen.calledWith(con.view, 'cancel', con.confirmNavigate), true,
        'navigates back if the view triggers "cancel" event');

    t.equal(listen.calledWith(con.view.tabView, 'change:value', con.changeValue),
        true, 'calls changeValue method if the tab view triggers change:value');

    t.equal(reply.calledWith({
        confirmNavigate: con.confirmNavigate,
    }, con), true, 'replies to requests');

    sand.restore();
    t.end();
});

test('settings/show/Controller: changeValue()', t => {
    const con = new Controller();

    con.changeValue({name: 'test', value: 'config'});
    t.deepEqual(con.changes.test, {name: 'test', value: 'config'},
        'saves new values of a config to "changes" property');

    sand.restore();
    t.end();
});

test('settings/show/Controller: save()', t => {
    const con = new Controller();
    con.view  = {triggerMethod: sand.stub(), options: {useDefault: 'test'}};
    const req = sand.stub(con.configsChannel, 'request').returns(Promise.resolve());
    sand.stub(con, 'hasChanges').returns(false);

    con.save();
    t.equal(req.notCalled, true, 'does not make a request if there are no changes');
    t.equal(con.view.triggerMethod.calledWith('saved'), true, 'triggers "saved" event');

    con.hasChanges.returns(true);
    const changes = {test: {name: 'test', value: 'config'}};
    con.changes = changes;

    con.save()
    .then(() => {
        t.equal(req.calledWith('saveConfigs', {
            configs    : changes,
        }), true, 'saves all changes');
        t.equal(con.changes.length, 0, 'resets changes');

        sand.restore();
        t.end();
    });
});

test('settings/show/Controller: confirmNavigate()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request').resolves('confirm');
    sand.stub(con, 'navigate');
    sand.stub(con, 'hasChanges').returns(false);
    sand.stub(_, 'i18n').callsFake(str => str);

    con.confirmNavigate({url: '/test'});
    t.equal(req.notCalled, true,
        'does not show the confirmation dialog if there are no changes');
    t.equal(con.navigate.calledWith({url: '/test'}), true, 'navigates to a page');

    con.hasChanges.returns(true);
    con.confirmNavigate({url: '/test2'})
    .then(() => {
        t.equal(req.calledWith('components/confirm', 'show', {
            content: 'You have unsaved changes',
        }), true, 'shows a confirmation dialog');

        t.equal(con.navigate.calledWith({url: '/test2'}), true, 'navigates to a page');

        sand.restore();
        t.end();
    });
});

test('settings/show/Controller: hasChanges()', t => {
    const con = new Controller();

    t.equal(con.hasChanges(), false, 'returns false if "changes" property is empty');

    con.changes = {el: ''};
    t.equal(con.hasChanges(), true, 'returns true if "changes" property is not empty');

    sand.restore();
    t.end();
});

test('settings/show/Controller: navigate()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    sand.stub(document.location, 'reload');

    con.navigate({url: '/test1'});
    t.equal(req.calledWith('utils/Url', 'navigate', {
        url : '/test1',
    }), true, 'makes "navigate" request');

    con.navigate();
    t.equal(req.calledWith('utils/Url', 'navigate', {
        url : '/notes',
    }), true, 'navigates to /notes page by default');
    t.equal(document.location.reload.called, true,
        'reloads the page to apply settings if it is not a settings page');

    sand.restore();
    t.end();
});
