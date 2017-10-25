/**
 * @file Test components/dropbox/main
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import '../../../../app/scripts/utils/underscore';
import initialize from '../../../../app/scripts/components/dropbox/main';
import Sync from '../../../../app/scripts/components/dropbox/Sync';
import View from '../../../../app/scripts/components/dropbox/settings/View';

let sand;
test('components/dropbox/main: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('components/dropbox/main', t => {
    const stub = sand.stub(Sync.prototype, 'init').resolves();

    initialize();
    t.equal(stub.notCalled, true, 'does not initialize Sync.js');

    sand.stub(Radio, 'request')
    .withArgs('collections/Configs', 'findConfigs')
    .returns({dropboxKey: ''})
    .withArgs('collections/Configs', 'findConfig')
    .returns('dropbox');

    initialize();
    t.equal(stub.called, true, 'msg');

    sand.restore();
    t.equal(Radio.request('components/dropbox', 'getSettingsView'), View,
        'replies with the settings view');

    sand.restore();
    t.end();
});
