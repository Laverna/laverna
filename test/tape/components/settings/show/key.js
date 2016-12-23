/**
 * Test components/settings/show/encryption/Key
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/encryption/Key';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/encryption/Key: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/encryption/Key: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('settings/show/encryption/Key: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.text, 'textarea');

    t.end();
});

test('settings/show/encryption/Key: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');

    t.equal(events['focus @ui.text'], 'selectAll',
        'selects everything in textarea');
    t.equal(events['click .btn--cancel'], 'destroy',
        'destroyes itself if cancel button is clicked');
    t.equal(events['click .btn--remove'], 'removeKey',
        'removes the public key if the button is clicked');

    t.end();
});

test('settings/show/encryption/Key: selectAll()', t => {
    const view = new View();
    view.ui    = {text: {select: sand.stub()}};

    view.selectAll();
    t.equal(view.ui.text.select.called, true, 'selects everything in the textarea');

    sand.restore();
    t.end();
});

test('settings/show/encryption/Key: removeKey()', t => {
    const view = new View({key: {armor: () => 'pub'}, model: {id: '1'}});
    const req  = sand.stub(Radio, 'request').returns(Promise.resolve());
    sand.stub(view, 'destroy');

    view.removeKey()
    .then(() => {
        t.equal(req.calledWith('collections/Configs', 'removePublicKey', {
            publicKey : 'pub',
            model     : view.model,
        }), true, 'removes the public key from the database');

        t.equal(view.destroy.called, true, 'destroyes itself after removing the key');

        sand.restore();
        t.end();
    });
});

test('settings/show/encryption/Key: serializeData()', t => {
    const view   = new View();
    view.options = {model: {id: '1'}, key: 'pub'};

    t.equal(view.serializeData(), view.options, 'returns options');

    t.end();
});

test('settings/show/encryption/Key: templateContext()', t => {
    const context = new View().templateContext();
    context.model = new Configs.prototype.model({
        value: {123412341234: 'pub'},
    });
    context.key   = {primaryKey: {
        fingerprint: '123412341234',
        algorithm  : 'rsa_sign_encrypt',
    }};

    t.equal(context.getArmor(), 'pub', 'returns armored public key');
    t.equal(context.getFingerprint(), '1234 1234 1234');
    t.equal(context.getType(), 'rsa');

    t.end();
});
