/**
 * Test components/setup/ContentView
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import _ from '../../../../app/scripts/utils/underscore';
import View from '../../../../app/scripts/components/setup/ContentView';

let sand;
test('setup/ContentView: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('setup/ContenView: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['keyup input'], 'onInputChange');
    t.equal(events['click #welcome--next'], 'onClickNext');
    t.end();
});

test('setup/ContenView: onReadyKey()', t => {
    const view = new View({username: 'test'});
    const trig = sand.stub(view, 'triggerMethod');
    const key  = {
        armor     : () => 'armored',
        toPublic  : () => {
            return {armor: () => 'public-armored'};
        },
    };

    view.onReadyKey({key});
    t.equal(trig.calledWith('save', {
        username : 'test',
        register : false,
        keys     : {privateKey: 'armored', publicKey: 'public-armored'},
    }), true, 'triggers "save"');

    view.options.user = {username: 'test2'};
    view.onReadyKey({key});
    t.equal(trig.calledWithMatch('save', {username : 'test2'}), true,
        'uses "user" option');

    sand.restore();
    t.end();
});

test('setup/ContentView: showWarning()', t => {
    const view = new View();
    view.ui    = {alert: {text: sand.stub()}};
    view.ui.alert.removeClass = sand.stub().returns({text: view.ui.alert.text});
    sand.stub(_, 'i18n').callsFake(str => str);

    view.showWarning('Hello');
    t.equal(view.ui.alert.text.calledWith('Hello'), true, 'shows the text');

    sand.restore();
    t.end();
});

test('setup/ContenView: onSaveError()', t => {
    const view    = new View({username: 'test'});
    const text    = sand.stub();
    const rmClass = sand.stub().returns({text});
    view.ui       = {alert: {removeClass: rmClass}};
    sand.stub(_, 'i18n').callsFake(txt => txt);

    view.onSaveError({err: 'error'});
    t.equal(rmClass.calledWith('hidden'), true, 'shows the message box');
    t.equal(text.calledWith('error'), true, 'changes the error message');

    view.onSaveError({err: {status: '0'}});
    t.equal(text.calledWith('Signal server error #0'), true, 'changes the error message');

    sand.restore();
    t.end();
});

test('setup/ContenView: onKeyError()', t => {
    const view = new View();
    sand.stub(view, 'onSaveError');

    view.onKeyError({err: 'key error'});
    t.equal(view.onSaveError.calledWith({err: 'key error'}), true,
        'calls "onSaveError" method');

    sand.restore();
    t.end();
});

test('setup/ContenView: serializeData()', t => {
    const opt = {key: 'pub'};

    t.deepEqual(new View(opt).serializeData(), opt, 'returns "options"');

    t.end();
});
