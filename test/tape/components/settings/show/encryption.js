/**
 * Test components/settings/show/encryption/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/encryption/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
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

test('settings/show/encryption/View: serializeData()', t => {
    const view = new View({collection: new Configs()});

    t.deepEqual(view.serializeData(), {
        models: view.collection.getConfigs(),
    });

    sand.restore();
    t.end();
});

test('settings/show/encryption/View: templateContext()', t => {
    const view     = new View();
    const context  = view.templateContext();
    context.models = {encryptPass: '1'};
    sand.stub(_, 'i18n', str => str);

    t.equal(context.passwordText(), 'encryption.change password',
        'asks a user to change the password if it is empty');

    context.models.encryptPass = '';
    t.equal(context.passwordText(), 'encryption.provide password',
        'asks a user to set a password if it is empty');

    sand.restore();
    t.end();
});
