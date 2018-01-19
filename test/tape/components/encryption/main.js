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
import Encrypt from '../../../../app/scripts/components/encryption/encrypt/Controller';

let sand;
test('encryption/main: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('encryption/Main', t => {
    const authInit = sand.stub(Auth.prototype, 'init');
    const encryptInit = sand.stub(Encrypt.prototype, 'init');
    const req  = sand.stub(Radio, 'request').callsFake((n, m, data) => data.callback());

    initialize();
    t.equal(req.callCount, 2, 'adds two initializer');
    t.equal(req.calledWithMatch('utils/Initializer', 'add', {name: 'App:auth'}), true,
        'adds App:auth initializer');
    t.equal(authInit.called, true, 'instantiates "auth" controller');
    t.equal(encryptInit.called, true, 'instantiates "auth" controller');

    sand.restore();
    t.end();
});
