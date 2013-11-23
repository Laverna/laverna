/*global define*/
/*global test*/
/*global equal*/
define(['models/tag'], function (Model) {
    'use strict';

    module('tags model');

    test('Can be created with default values', function() {
        var notebook = new Model();
        equal(notebook.get('name'), '', 'Default name for tag is empty');
    });

    test('Update attributes', function(){
        var notebook = new Model();
        notebook.set('name', 'new name');
        equal(notebook.get('name'), 'new name');
    });
});
