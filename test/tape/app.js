/**
 * Test the core app: App.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const Backbone = {history: {start: sinon.stub()}};
const App = proxyquire('../../app/scripts/App.js', {backbone: Backbone}).default;

let sand;
test('App: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('App: initialize()', t => {
    t.equal(App.prototype.channelName, 'App', 'creates App channel');

    const trigger = sand.stub();
    sand.stub(App.prototype, 'getChannel').returns({trigger});

    const spy     = sand.spy(App.prototype, 'initialize');
    const app     = new App();

    t.equal(typeof app, 'object', 'is an object');
    t.equal(spy.called, true, 'calls initialize()');
    t.equal(trigger.calledWith('init'), true, 'triggers "init" event');

    sand.restore();
    t.end();
});

test('App: onStart()', t => {
    const trigger = sand.stub();
    sand.stub(App.prototype, 'getChannel').returns({trigger});

    const app     = new App();
    const spy     = sand.spy(app, 'onStart');

    app.start();
    t.equal(spy.called, true, 'calls onStart()');
    t.equal(Backbone.history.start.calledWith({pushStart: false}), true,
        'starts Backbone history');
    t.equal(trigger.calledWith('start'), true, 'triggers "start" event');

    sand.restore();
    t.end();
});

test('App: lazyStart()', t => {
    t.plan(2);

    const app  = new App();
    const stub = sand.stub(app, 'start');

    const res = app.lazyStart();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(stub.called, true, 'eventually calls start()');
        sand.restore();
    });
});
