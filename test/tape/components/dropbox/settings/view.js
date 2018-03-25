/**
 * @file Test components/dropbox/settings/View
 */
import test from 'tape';
import sinon from 'sinon';

import '../../../../../app/scripts/utils/underscore';
import Configs from '../../../../../app/scripts/collections/Configs';
import View from '../../../../../app/scripts/components/dropbox/settings/View';

let sand;
test('components/dropbox/settings/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('components/dropbox/settings/View: serializeData()', t => {
    const collection = new Configs();
    collection.resetFromObject(collection.configNames);
    const view = new View({collection});

    const data = view.serializeData();
    t.equal(data.dropboxKey, '', 'is empty string');
    t.equal(data.placeholder, 'Optional', 'custom Dropbox API key is not needed');

    Object.defineProperty(view, 'dropboxKeyNeed', {get: () => true});
    collection.get('dropboxKey').set('value', '1234');
    const data2 = view.serializeData();
    t.equal(data2.dropboxKey, '1234', 'is equal to the current value');
    t.equal(data2.placeholder, 'Required', 'custom Dropbox API key is required');

    sand.restore();
    t.end();
});
