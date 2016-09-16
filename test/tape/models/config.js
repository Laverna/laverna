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

test('Config: isPassword()', t => {
    const config = new Config({name: 'encryptPass'});
    t.equal(config.isPassword({}), true, 'returns true if models name is encryptPass');

    config.set('name', 'test');
    t.equal(config.isPassword({name: 'encryptPass'}), true,
        'returns true if data.name is equal to encryptPass');

    t.equal(config.isPassword({name: 'encrypt'}), false,
        'returns false if all checks fail');

    t.end();
});

test('Config: isPasswordHash()', t => {
    const config = new Config({name: 'encryptPass', value: [1, 2, 3]});

    t.equal(config.isPasswordHash({value: '1'}), true,
        'returns true if it is password model and it is not equal to the previous');

    t.equal(config.isPasswordHash({value: [1, 2, 3]}), false,
        'returns false if password has not changed');

    config.set('name', 'no');
    t.equal(config.isPasswordHash({value: '1'}), false,
        'returns false if it is not password model');

    t.end();
});
