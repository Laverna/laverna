/**
 * Test models/Config.js
 * @file
 */
import test from 'tape';

import Config from '../../../app/scripts/models/Config';

test('Config: idAttribute()', t => {
    const config = new Config();
    t.equal(config.idAttribute, 'name', 'uses "name" as ID attribute');
    t.end();
});

test('Config: defaults()', t => {
    const config = new Config();

    t.equal(typeof config.defaults, 'object', 'has "defaults" property');
    t.equal(config.defaults.name, '', 'for default name is equal to empty string');
    t.equal(config.defaults.value, '', 'for default value is equal to empty string');

    t.end();
});

test('Config: storeName()', t => {
    const config = new Config();
    t.equal(config.storeName, 'configs');
    t.end();
});

test('Config: validate()', t => {
    const config = new Config();

    t.equal(config.validate({name: ''}).length, 1,
        'returns array of errors if name is empty');

    t.equal(config.validate({name: 'test'}), undefined,
        'returns nothing if there are no validation errors');

    t.end();
});
