/**
 * Test components/settings/show/encryption/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import * as openpgp from 'openpgp';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/encryption/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
import Profile from '../../../../../app/scripts/models/Profile';
/* eslint-enable */

let sand;
const user = new Profile({username: 'alice', publicKey: 'pub', privateKey: 'priv'});
test('settings/show/encryption/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/encryption/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    t.end();
});

test('settings/show/encryption/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.useEncrypt, '#useEncryption');
    t.end();
});

test('settings/show/encryption/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['click #btn--privateKey'], 'showPrivateKey',
        'shows the private information if the button is clicked');
    t.equal(events['click #btn--passphrase'], 'showPasswordView',
        'shows the password form if the button is clicked');
    t.equal(events['change @ui.useEncrypt'], 'useEncryption',
        'shows a confirmation dialog before disabling encryption');

    t.end();
});

test('settings/show/encryption/View: collectionEvents()', t => {
    const events = View.prototype.collectionEvents();
    t.equal(typeof events, 'object');
    t.equal(events.change, 'render', 're-renders the view if the collection changes');
    t.end();
});

test('settings/show/encryption/View: initialize()', t => {
    sand.stub(Radio, 'request')
    .withArgs('collections/Profiles', 'getUser')
    .returns(user);

    const view = new View();
    t.equal(view.user, user, 'creates .user property');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showPrivateKey()', t => {
    const view      = new View();
    view.privateKey = 'priv';
    sand.stub(view, 'showKey');

    view.showPrivateKey();
    t.equal(view.showKey.calledWith(view.privateKey, true), true,
        'calls "showKey" method');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showKey()', t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request');
    view.collection = {get: sand.stub().withArgs('publicKeys')
    .returns({})};

    view.showKey('pub', true);
    t.equal(req.calledWithMatch('Layout', 'show', {
        region : 'modal',
        view   : {},
    }), true, 'renders the key view');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: showPasswordView()', t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request');

    view.user = user;
    view.showPasswordView();
    t.equal(req.calledWithMatch('Layout', 'show', {
        view   : {},
        region : 'modal',
    }), true, 'renders the password form view');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: useEncryption()', async t => {
    const view = new View();
    const req  = sand.stub(Radio, 'request').resolves('confirm');
    const is   = sand.stub().returns(true);
    view.ui    = {useEncrypt: {is, prop: sand.stub()}};

    const res1 = await view.useEncryption();
    t.equal(res1, true,
        'returns "true" if a user is enabling encryption');
    t.equal(req.notCalled, true, 'does not show the confirmation dialog');
    is.returns(false);

    await view.useEncryption();
    t.equal(req.calledWith('components/confirm', 'show'), true,
        'shows the confirmation dialog');

    t.equal(view.ui.useEncrypt.prop.notCalled, true,
        'does nothing if a user confirmed they want to disable encryption');

    req.resolves('reject');
    await view.useEncryption();
    t.equal(view.ui.useEncrypt.prop.calledWith('checked', true), true,
        're-enables encryption if a user changed their mind');

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: serializeData()', t => {
    const coll = new Configs();
    coll.resetFromObject(coll.configNames);
    const view = new View({collection: coll});
    view.user  = user;

    const read = sand.stub(openpgp.key, 'readArmored');
    read.withArgs('priv').returns({keys: ['privTest']});
    read.withArgs('pub').returns({keys: ['pubTest']});

    t.deepEqual(view.serializeData(), {
        models: view.collection.getConfigs(),
        privateKey : 'privTest',
    });

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: templateContext()', t => {
    sand.restore();
    t.end();
});
