/**
 * Test utils/Keybindings.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import _ from 'underscore';
import Configs from '../../../app/scripts/collections/Configs';
import Radio from 'backbone.radio';

const Mousetrap     = require('mousetrap');
global.Mousetrap    = Mousetrap;

const keybindings   = require('../../../app/scripts/utils/Keybindings');
const Keybindings   = keybindings.default;

let sand;
test('utils/Keybindings: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('utils/Keybindings: channel', t => {
    t.equal(typeof Keybindings.prototype.channel, 'object', 'is an object');
    t.equal(Keybindings.prototype.channel.channelName, 'utils/Keybindings');
    t.end();
});

test('utils/Keybindings: constructor()', t => {
    const spy = sand.spy(Keybindings.prototype.channel, 'reply');
    const key = new Keybindings();
    t.equal(spy.called, true, 'starts replying to requests');
    sand.restore();
    key.channel.stopReplying();
    t.end();
});

test('utils/Keybindings: toggle()', t => {
    const key     = new Keybindings();
    const unpause = sand.stub(Mousetrap, 'unpause');
    const pause   = sand.stub(Mousetrap, 'pause');

    key.paused = true;
    key.toggle();
    t.equal(unpause.called, true, 'unpauses if paused status is true');

    key.paused = false;
    key.toggle();
    t.equal(pause.called, true, 'unpauses if paused status is false');

    sand.restore();
    key.channel.stopReplying();
    t.end();
});

test('utils/Keybindings: bind()', t => {
    const key  = new Keybindings();
    const coll = new Configs();
    sand.stub(key, 'bindApp');
    sand.stub(key, 'bindJump');

    const find = sand.stub().returns(Promise.resolve(coll));
    Radio.replyOnce('collections/Configs', 'find', find);

    const res = key.bind();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(key.collection, coll, 'creates a local copy of config collection');
        t.equal(find.called, true, 'fetches configs');
        t.equal(key.bindApp.called, true, 'binds application shortcuts');
        t.equal(key.bindJump.called, true, 'binds jump shortcuts');

        sand.restore();
        key.channel.stopReplying();
        t.end();
    });
});

test('utils/Keybindings: bindApp()', t => {
    const key      = new Keybindings();
    key.collection = new Configs();
    key.collection.resetFromObject(key.collection.configNames);

    global.tlog = t.comment;
    const spy  = sand.spy(key.collection, 'appShortcuts');
    const bind = sand.spy(Mousetrap, 'bind');

    key.bindApp();
    t.equal(spy.called, true, 'gets app shortcut configs');
    t.equal(bind.callCount, key.collection.appShortcuts().length,
        'binds all shortcuts');

    key.channel.once('appCreateNote', () => {
        sand.restore();
        key.channel.stopReplying();
        t.end();
    });

    Mousetrap.trigger('c');
});

test('utils/Keybindings: bindJump()', t => {
    const key      = new Keybindings();
    const bind     = sand.spy(Mousetrap, 'bind');
    const navigate = sand.stub(key, 'navigate');
    key.collection = new Configs();
    key.collection.resetFromObject(key.collection.configNames);

    key.bindJump();
    t.equal(bind.callCount, _.keys(key.jumpLinks).length, 'binds all jump shortcuts');

    Mousetrap.trigger('g i');
    t.equal(navigate.calledWith(key.jumpLinks.jumpInbox), true,
        'opens a link');

    sand.restore();
    key.channel.stopReplying();
    t.end();
});

test('utils/Keybindings: navigate()', t => {
    const key     = new Keybindings();
    const request = sand.stub(Radio, 'request');

    key.navigate('/notes');
    const called = request.calledWith('utils/Url', 'navigate', {
        url: '/notes',
    });
    t.equal(called, true, 'makes a navigate request');

    sand.restore();
    key.channel.stopReplying();
    t.end();
});
