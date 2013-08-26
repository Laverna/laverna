/*global define*/
/*global test*/
/*global equal*/
// /*global notDeepEqual*/
define(['models/note', 'collections/notes', 'backbone', 'localStorage'],
function (Note, Notes, Backbone, Store) {
    'use strict';

    module('Notes collection', {
        setup: function () {
            this.note = new Note();

            this.secondNote = new Note({
                title: 'Hello, world'
            });

            this.notes = new Notes();
            this.notes.add(this.note);
            this.notes.add(this.secondNote);
        },

        teardown: function () {
            window.errors = null;
        }
    });

    test('Has the Note model', function () {
        equal(this.notes.model, Note);
    });

    test('Notes is added to collection', function () {
        equal(this.notes.length, 2);
    });

    test('Uses localStorage', function () {
        var storage = new Store('vimarkable.notes');
        equal(this.notes.localStorage.name, storage.name);
    });

    test('It return an array of the favorite notes', function () {
        var notes = this.notes.getFavorites();
        equal(notes.length, 0);

        this.notes.add(new Note({
            isFavorite: 1
        }));

        this.notes.add(new Note({
            isFavorite: 1
        }));

        var anotherNotes = this.notes.getFavorites();
        equal(anotherNotes.length, 2);
    });

});
