/**
 * Test workers/worker.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Module from '../../../app/scripts/workers/Module';

let sand;
test('workers/Module: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('workers/Module: fileName()', t => {
    const module = new Module();

    t.equal(typeof module.fileName, 'string', 'returns string');
    t.equal(module.fileName, 'workers/module', 'uses default value');

    t.end();
});

test('workers/Module: channelName', t => {
    const module = new Module();
    t.equal(module.channelName, module.fileName, 'uses fileName');
    t.end();
});

test('workers/Module: channel()', t => {
    const module = new Module();
    t.equal(typeof module.channel, 'object');
    t.end();
});

test('workers/Module: radioRequests()', t => {
    const module = new Module();
    t.equal(typeof module.radioRequests, 'object', 'returns an object');
    t.end();
});

test('workers/Module: constructor()', t => {
    const replies = {};
    const reply   = sand.stub(Module.prototype.channel, 'reply')
    .callsFake((key, func) => {
        replies[key] = func;
    });

    Object.defineProperty(Module.prototype, 'radioRequests', {
        get: () => {
            return {test: 'test'};
        },
    });
    const module = new Module();

    t.equal(reply.calledWith('test'), true, 'replies to requests');

    const process = sand.stub(module, 'processRequest');
    replies.test('test');
    t.equal(process.calledWith('test', ['test']), true, 'calls processRequest method');

    sand.restore();
    t.end();
});

test('workers/Module: processRequest() - no worker', t => {
    const module = new Module();
    module.save  = sand.stub();
    module.save.returns('result');

    const args = [1, 2];

    t.equal(typeof importScripts, 'undefined', 'importScripts is undefined');
    t.equal(!window.Worker, true, 'does not support workers');

    t.equal(module.processRequest('save', args), 'result',
        'returns the result of executing a method');
    t.equal(module.save.calledWith(args[0], args[1]), true,
        'uses arguments');

    delete module.save;
    sand.restore();
    t.end();
});

test('workers/Module: processRequest() - delegate to worker', t => {
    const module = new Module();
    const stub   = sand.stub(module, 'delegateToWorker');
    window.Worker = true;

    const args = [1, 2];
    module.processRequest('save', args);
    t.equal(stub.calledWith('save', args), true,
        'delegates to worker if it is supported');

    sand.restore();
    t.end();
});

test('workers/Module: delegateToWorker()', t => {
    const module = new Module();
    const stub   = sand.stub(Radio, 'request').returns(Promise.resolve());

    module.delegateToWorker('save', [1, 2]);
    const called = stub.calledWith('workers/Delegator', 'execute', {
        args   : [1, 2],
        method : 'save',
        file   : module.channelName,
    });
    t.equal(called, true, 'msg');

    sand.restore();
    t.end();
});

test('workers/Module: after()', t => {
    sand.restore();
    t.end();
});
