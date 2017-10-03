/**
 * Test workers/Delegator
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

// eslint-disable-next-line
import {default as Delegator, initializer} from '../../../app/scripts/workers/Delegator';

let sand;
test('workers/Delegator: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('workers/Delegator: channel', t => {
    t.equal(Delegator.prototype.channel.channelName, 'workers/Delegator');
    t.end();
});

test('workers/Delegator: constructor()', t => {
    const channel = Delegator.prototype.channel;
    const reply   = sand.stub(channel, 'reply');
    const trigger = sand.stub(channel, 'trigger');

    const con = new Delegator();
    t.equal(Array.isArray(con.promises), true, 'creates "promises" property');

    t.equal(reply.calledWith({
        execute: con.delegateMethod,
    }, con), true, 'replies to requests');

    t.equal(trigger.calledWith('init'), true, 'triggers "init" event');

    sand.restore();
    t.end();
});

test('workers/Delegator: delegateMethod()', t => {
    const con = new Delegator();
    sand.stub(con, 'postMessage');

    const data = {args: []};
    con.delegateMethod(data);
    t.equal(con.postMessage.calledWith('execute', data), true,
        'calls postMessage method');

    sand.restore();
    t.end();
});

test('workers/Delegator: postMessage()', t => {
    const con    = new Delegator();
    const worker = {unresolved: 0, instance: {postMessage: sand.stub()}};
    sand.stub(con, 'getWorker').returns(worker);

    con.postMessage('execute', {id: '1'});
    t.equal(con.promises.length, 1, 'saves the promise in the array of of promises');

    t.equal(worker.instance.postMessage.calledWith({
        action    : 'execute',
        promiseId : 0,
        data      : {id: '1'},
    }), true, 'posts a message to a WebWorker');

    sand.restore();
    t.end();
});

test('workers/Delegator: spawnWorkers()', t => {
    const con  = new Delegator();
    const cpus = window.navigator.hardwareConcurrency || 1;
    sand.stub(con, 'spawnWorker').returns({});

    con.spawnWorkers();
    t.equal(Array.isArray(con.workers), true, 'creates an array of workers');
    t.equal(con.workers.length, cpus, 'spawns a WebWorker for each CPU core');

    sand.restore();
    t.end();
});

test('workers/Delegator: spawnWorker()', t => {
    const con    = new Delegator();
    const worker = {addEventListener: sand.stub()};
    const stub   = sand.stub().returns(worker);
    Object.defineProperty(con, 'WebWorker', {get: () => stub});

    const res = con.spawnWorker();
    t.equal(typeof res, 'object', 'returns an object');
    t.equal(res.instance, worker, 'the result contains a WebWorker instance');

    t.equal(worker.addEventListener.calledWith('message'), true,
        'listens to "message" event');
    t.equal(worker.addEventListener.calledWith('error'), true,
        'handles WebWorker errors');

    sand.restore();
    t.end();
});

test('workers/Delegator: onMessage()', t => {
    const con = new Delegator();
    sand.stub(con, 'onPromise');

    const worker = {instance: 'test'};

    con.onMessage(worker, {data: {action: 'resolve'}});
    t.equal(con.onPromise.calledWithMatch(worker, {action: 'resolve'}), true,
        'calls onPromise method if action is equal to "resolve"');

    con.onMessage(worker, {data: {action: 'reject'}});
    t.equal(con.onPromise.calledWithMatch(worker, {action: 'reject'}), true,
        'calls onPromise method if action is equal to "reject"');

    con.onMessage(worker, {data: {action: null}});
    t.equal(con.onPromise.calledWithMatch(worker, {action: null}), false,
        'does nothing method if action is not equal to "reject/resolve"');

    sand.restore();
    t.end();
});

test('workers/Delegator: onPromise()', t => {
    const con     = new Delegator();
    const promise = {resolve: sand.stub(), reject: sand.stub()};
    const worker  = {unresolved: 10};
    sand.stub(con, 'getPromise').returns(promise);

    con.onPromise(worker, {promiseId: 1, action: 'resolve', data: {id: '2'}});
    t.equal(con.getPromise.calledWith(1), true, 'searches for the promise');
    t.equal(worker.unresolved, 9,
        'decreases the number of unresolved promises for a worker');
    t.equal(con.promises[1], null, 'removes the promise from the array of promises');
    t.equal(promise.resolve.calledWith({id: '2'}), true, 'resolves the promise');

    con.onPromise(worker, {promiseId: 1, action: 'reject', data: {id: '3'}});
    t.equal(promise.reject.calledWith({id: '3'}), true, 'rejects the promise');

    con.onPromise(worker, {promiseId: 1, action: '404'});
    t.equal(worker.unresolved, 8, 'does nothing if it is not a promise action');

    sand.restore();
    t.end();
});

test('workers/Delegator: getPromise()', t => {
    const con    = new Delegator();
    con.promises = [{resolve: 'test'}];

    t.equal(con.getPromise(0), con.promises[0], 'returns the promise');
    t.throws(con.getPromise);

    sand.restore();
    t.end();
});

test('workers/Delegator: getWorker()', t => {
    const con   = new Delegator();
    con.workers = [{instance: '0', unresolved: 10}];

    t.equal(con.getWorker(), con.workers[0],
        'returns the first worker if there is only 1 worker');

    con.workers.push({instance: '1', unresolved: 2});
    t.equal(con.getWorker({file: 'models/Db'}), con.workers[0],
        'returns the first worker if it is an indexedDB operation');

    con.workers.push({instance: '2', unresolved: 0});
    t.equal(con.getWorker(), con.workers[2],
        'returns a worker that is not in use');

    con.workers[2].unresolved = 3;
    t.equal(con.getWorker(), con.workers[1],
        'returns the least loaded worker');

    t.end();
});

test('workers/Delegator: initializer()', t => {
    const spawn = sand.stub(Delegator.prototype, 'spawnWorkers');
    global.Modernizr = {webworkers: false};

    initializer();
    t.equal(spawn.notCalled, true, 'does nothing if WebWorker are not supported');

    global.Modernizr.webworkers = true;
    initializer();
    t.equal(spawn.called, true, 'spawns WebWorkers');

    sand.restore();
    t.end();
});

test('workers/Delegator: after()', t => {
    Radio.channel('workers/Delegator').stopReplying();
    sand.restore();
    t.end();
});
