/*global define*/
/*global test*/
/*global equal*/
define(['models/config'], function (Model) {
    'use strict';

    module('Config model');

    test('Can be created with default values', function() {
        var note = new Model();
        equal(note.get('name'), '', 'For default config name is empty');
        equal(note.get('value'), '', 'For default config value is empty');
    });

    test('Update attributes', function(){
        var note = new Model();
        note.set('name', 'new-config');
        equal(note.get('name'), 'new-config');
        equal(note.get('value'), '', 'For default config value is empty');
    });
});
