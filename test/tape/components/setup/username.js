/**
 * Test components/setup/username/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../app/scripts/utils/underscore';
import ContentView from '../../../../app/scripts/components/setup/ContentView';
import View from '../../../../app/scripts/components/setup/username/View';

let sand;
test('setup/username/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/username/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object');
    t.end();
});

test('setup/username/View: onInputChange()', t => {
    const view = new View();
    const attr = sand.stub();
    view.ui    = {next: {attr}, username: {val: () => 'Test'}};

    view.onInputChange();
    t.equal(attr.calledWith('disabled', false), true, 'enables "next" button');

    view.ui.username.val = () => '';
    view.onInputChange();
    t.equal(attr.calledWith('disabled', true), true, 'disables "next" button');

    sand.restore();
    t.end();
});

test('setup/username/View: onClickNext()', t => {
    const view = new View();
    const trig = sand.stub(view, 'triggerMethod');
    view.ui    = {username: {val: () => 'user'}};

    view.onClickNext();
    t.equal(trig.calledWith('check:user', {
        username: 'user',
    }), true, 'triggers "check:user"');

    sand.restore();
    t.end();
});

test('setup/username/View: onNameTaken()', t => {
    const view = new View();
    const user = {username: 'test', publicKey: 'pub'};
    view.ui    = {
        warning : {removeClass: sand.stub()},
        alert   : {text: sand.stub()},
    };

    view.onNameTaken({user});
    t.equal(view.options.user, user, 'creates "user" property');
    t.equal(view.ui.warning.removeClass.calledWith('hidden'), true,
        'shows the warning');
    t.equal(view.ui.alert.text.called, true, 'changes warning message');

    sand.restore();
    t.end();
});

test('setup/username/View: onReadyKey()', t => {
    const user = {username: 'test', publicKey: 'pub', fingerprint: 'print'};
    const view = new View({user});
    const key  = {primaryKey: {fingerprint: 'print!'}};
    view.ui    = {alert: {text: sand.stub()}};
    const stub = sand.stub(ContentView.prototype, 'onReadyKey');

    view.onReadyKey({key});
    t.equal(view.ui.alert.text.called, true,
        'changes the warning message that the fingerprints do not match');

    key.primaryKey.fingerprint = 'print';
    view.onReadyKey({key});
    t.equal(stub.calledWith({key}), true,
        'calls the parent method if the fingerprints match');

    sand.restore();
    t.end();
});
