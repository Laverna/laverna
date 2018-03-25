/**
 * Test components/setup/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import initialize from '../../../../app/scripts/components/setup/main';
import Controller from '../../../../app/scripts/components/setup/Controller';

let sand;
test('setup/main: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/main: initialize()', t => {
    const init  = sand.stub(Controller.prototype, 'init');
    const reply = sand.stub(Radio, 'reply');
    const req   = sand.stub(Radio, 'request').callsFake((...args) => {
        args[2].callback();
    });

    initialize();
    t.equal(reply.calledWith('components/setup', 'start'), true,
        'replies to "start" request');

    t.equal(req.calledWithMatch('utils/Initializer', 'add', {
        name: 'App:components',
    }), true, 'adds App:components initializer');

    t.equal(init.called, true, 'calls Controller.init method');

    sand.restore();
    t.end();
});
