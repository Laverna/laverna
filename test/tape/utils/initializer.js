/**
 * Test the initializer: utils/Initializer.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Initializer from '../../../app/scripts/utils/Initializer';

let sand;
test('Initializer: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('Initializer: constructor()', t => {
    sand.spy(Initializer.prototype.channel, 'reply');
    sand.spy(Initializer.prototype.channel, 'trigger');
    const init = new Initializer();

    t.equal(typeof init._inits, 'object', 'creates _inits property');
    t.equal(init.channel.reply.calledWith('add'), true,
        'replies to add requests');
    t.equal(init.channel.reply.calledWith('start'), true,
        'replies to start requests');
    t.equal(init.channel.trigger.calledWith('init'), true,
        'triggers init event');

    init.channel.stopReplying('add', 'start');
    t.end();
});

test('Initializer: add()', t => {
    const init = new Initializer();

    init.add({name: 'test', callback: () => {}});

    t.equal(typeof init._inits.test, 'object',
        'creates a new array of callbacks');
    t.equal(init._inits.test.length, 1,
        'saves a callback to the array');

    t.end();
});

test('Initializer: start() - object as argument', t => {
    const init = new Initializer();
    sand.spy(init, 'startInit');
    const stub  = sand.stub().returns(Promise.resolve());
    const stub2 = sand.stub().returns(Promise.resolve());

    t.plan(4);

    init.add({name: 'test', callback: stub});
    init.add({name: 'test2', callback: stub2});

    init.start({
        names   : ['test', 'test2'],
        options : {t: 1},
    })
    .then(() => {
        t.equal(init.startInit.calledWith('test'), true, 'calls the first initializer');
        t.equal(init.startInit.calledWith('test2'), true, 'calls the second initializer');

        t.equal(stub.calledWith({t: 1}), true,
            'executes the first initializer\'s callbacks');
        t.equal(stub2.calledAfter(stub), true,
            'executes the second initializer\'s callback after the first');

        sand.restore();
    })
    .catch(err => t.comment(`error ${err}`));
});

test('Initializer: start() - string as argument', t => {
    const init = new Initializer();
    const stub  = sand.stub().returns(Promise.resolve());
    init.add({name: 'test', callback: stub});

    t.plan(1);
    init.start('test')
    .then(() => t.equal(stub.called, true));
});

test('Initializer: startInit()', t => {
    const init  = new Initializer();
    const stub  = sand.stub().returns('');
    const stub2 = sand.stub().returns(Promise.resolve());
    t.plan(3);

    init.add({name: 'test', callback: stub});
    init.add({name: 'test', callback: stub2});

    init.startInit('test', {t: 1})
    .then(() => {
        t.equal(stub.called, true, 'executes the first callback');
        t.equal(stub2.called, true, 'executes the second callback');

        t.equal(typeof init.startInit('test2').then, 'function',
            'returns a promise even if there are no initilizers with a key');
    });
});
