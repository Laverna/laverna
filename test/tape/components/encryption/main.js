/**
 * Test components/encryption/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import initialize from '../../../../app/scripts/components/encryption/main';
import Auth from '../../../../app/scripts/components/encryption/auth/Controller';

let sand;
test('encryption/main: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('encryption/Main', t => {
    const init = sand.stub(Auth.prototype, 'init');
    const req  = sand.stub(Radio, 'request', (n, m, data) => data.callback());

    initialize();
    t.equal(req.calledWithMatch('utils/Initializer', 'add', {name: 'App:auth'}), true,
        'adds App:auth initializer');
    t.equal(init.called, true, 'instantiates "auth" controller');

    sand.restore();
    t.end();
});
