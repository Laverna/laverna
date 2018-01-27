/**
 * Test components/settings/show/general/View
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

/* eslint-disable */
import _ from '../../../../../app/scripts/utils/underscore';
import View from '../../../../../app/scripts/components/settings/show/general/View';
import Behavior from '../../../../../app/scripts/components/settings/show/Behavior';
import Configs from '../../../../../app/scripts/collections/Configs';
/* eslint-enable */

let sand;
test('settings/show/general/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('settings/show/general/View: behaviors()', t => {
    const behaviors = View.prototype.behaviors;
    t.equal(Array.isArray(behaviors), true, 'returns an array');
    t.equal(behaviors.indexOf(Behavior) !== -1, true, 'uses the behavior');

    sand.restore();
    t.end();
});

test('settings/show/general/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['change @ui.theme'], 'previewTheme');
    t.end();
});

test('settings/show/general/View: ui()', t => {
    const ui = View.prototype.ui();
    t.equal(typeof ui, 'object', 'returns an object');
    t.equal(ui.theme, '#theme');
    t.end();
});

test('settings/show/general/View: serializeData()', t => {
    const collection = new Configs();
    collection.resetFromObject(collection.configNames);
    const useDefault = {attributes: {id: 'useDefaultConfigs'}};

    const view = new View({collection, useDefault, profileId: 'test'});
    const res  = view.serializeData();

    t.equal(typeof res, 'object', 'returns an object');
    t.equal(typeof res.locales, 'object', 'has locales');
    t.deepEqual(res.models, collection.getConfigs(), 'has models');
    t.deepEqual(typeof res.themes, 'object', 'has themes');
    t.equal(res.appLang, 'en', 'has appLang');
    t.equal(res.theme, 'default', 'has theme');

    t.end();
});

test('settings/show/general/View: templateContext()', t => {
    const view    = new View();
    const context = view.templateContext();

    context.appLang = 'en';
    t.equal(context.selectLocale('en'), ' selected',
        'selects a locale if it is equal to appLang property');

    context.appLang = 'en-us';
    t.equal(context.selectLocale('en'), ' selected',
        'selects a locale if appLang contains the keyword');

    context.appLang = 'en-us';
    t.equal(context.selectLocale('fr'), undefined,
        'does nothing if the locale is not equal to appLang');

    t.end();
});
