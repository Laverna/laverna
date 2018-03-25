/**
 * Test utils/I18n.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import i18next from 'i18next';
import i18nextXhr from 'i18next-xhr-backend';
import Radio from 'backbone.radio';

import {default as I18n, initialize} from '../../../app/scripts/utils/I18n';

let sand;
test('Initializer: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('utils/I18nn: initialize()', t => {
    const i18n = new I18n();
    sand.stub(i18n, 'getLang').returns(Promise.resolve('en'));
    sand.stub(i18n, 'initLocale');

    const res = i18n.initialize();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(i18n.getLang.called, true,
            'gets language from settings or browser');

        t.equal(i18n.initLocale.calledWith('en'), true,
            'initializes i18next after getting the language');

        sand.restore();
        t.end();
    });
});

test('utils/I18nn: initialize() - reject', t => {
    const i18n = new I18n();
    sand.stub(i18n, 'getLang').returns(Promise.reject('error test'));

    i18n.initialize().catch(err => {
        t.equal(err, 'error test');
        t.end();
    });
});

test('utils/I18nn: initLocale()', t => {
    const i18n = new I18n();

    sand.spy(i18next, 'use');
    sand.stub(i18next, 'init').callsFake((opt, res) => res());

    const res = i18n.initLocale('en');
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(i18next.use.calledWith(i18nextXhr), true, 'enables XHR plugin');

    res.then(() => {
        t.equal(i18next.init.calledWithMatch({lng: 'en'}), true,
            'initializes i18next');
        sand.restore();
        t.end();
    });
});

test('utils/I18nn: getLang() - configs', t => {
    const i18n = new I18n();
    const req  = sand.stub(Radio, 'request').returns('en');
    sand.spy(i18n, 'getBrowserLang');

    const res = i18n.getLang();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(lng => {
        t.equal(req.calledWith('collections/Configs', 'findConfig', {
            name: 'appLang',
        }), true, 'requests the language from settings');

        t.equal(lng, 'en', 'returns the result of request');
        t.equal(i18n.getBrowserLang.notCalled, true,
            'does not try to get language from browser');

        sand.restore();
        t.end();
    });
});

test('utils/I18nn: getLang() - browser', t => {
    const i18n = new I18n();
    sand.stub(i18n, 'getBrowserLang').returns('es');

    const res = i18n.getLang();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(lng => {
        t.equal(lng, 'es');
        t.equal(i18n.getBrowserLang.called, true, 'gets language from browser');

        sand.restore();
        t.end();
    });
});

test('utils/I18nn: getBrowserLang()', t => {
    const i18n = new I18n();
    const res  = i18n.getBrowserLang();

    t.equal(typeof res, 'string', 'returns string');

    t.end();
});

test('utils/I18nn: initializes itself', t => {
    const stub = sand.stub(I18n.prototype, 'initialize');
    const req  = sand.stub(Radio, 'request');

    t.equal(typeof initialize, 'function', 'it is a function');

    const callback = initialize();

    t.equal(req.calledWith('utils/Initializer', 'add', {
        callback,
        name: 'App:utils',
    }), true, 'initializes at start');

    t.equal(req.calledWith('utils/Initializer', 'add', {
        callback,
        name: 'App:last',
    }), true, 'initializes before app starts');

    callback();
    t.equal(stub.called, true, 'calls initialize method');

    sand.restore();
    t.end();
});
