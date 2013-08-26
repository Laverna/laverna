/*global define*/
// /*global test*/
// /*global expect*/
// /*global equal*/
define(['scripts/models/note'], function (Model) {
    'use strict';

    module('Note model');
    test('Can be created with default values', function(){
        var note = new Model();
        equal(note.get('notebookId'), 0, 'Default notebook id for notes is 0');
        equal(note.get('isFavourite'), 0, 'Defaultly notebook is not favourite');
    });
    test('Update attributes', function(){
        var note = new Model();
        note.set('title', 'new title');
        equal(note.get('title'), 'new title');
    });
});
