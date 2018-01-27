/**
 * Test models/diffsync/main
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import initializer from '../../../../app/scripts/models/diffsync/main';
import Peer from '../../../../app/scripts/models/Peer';
import Core from '../../../../app/scripts/models/diffsync/Core';

let sand;
test('models/diffsync/main: before()', t => {
    sand = sinon.sandbox.create();
    Radio.channel('App').stopListening();
    t.end();
});

test('models/diffsync/main: initializer()', t => {
    const req  = sand.stub(Radio, 'request')
    .withArgs('collections/Configs', 'findConfig', {name: 'cloudStorage'})
    .returns('p2p')
    .withArgs('collections/Configs', 'findConfigs')
    .returns({});

    const init  = sand.stub(Peer.prototype, 'init');
    const init2 = sand.stub(Core.prototype, 'init');

    const start = initializer();
    t.equal(typeof start, 'function', 'returns the callback');

    start();
    t.equal(init.called, true, 'initializes the peer class');
    t.equal(init2.called, true, 'initializes the differential synchronization core');

    req.withArgs('collections/Configs', 'findConfig', {name: 'cloudStorage'})
    .returns('dropbox');

    start();
    t.equal(init.callCount, 1, 'does nothing if p2p is not used');

    sand.restore();
    t.end();
});
