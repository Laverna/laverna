/*global define*/
/*global test*/
/*global equal*/
// /*global notDeepEqual*/
define(['models/notebook', 'collections/notebooks', 'backbone', 'localStorage'],
function (Notebook, Notebooks, Backbone, Store) {
    'use strict';

    module('Notebooks collection', {
        setup: function () {
            this.notebook = new Notebook();

            this.secondNotebook = new Notebook({
                name: 'Hello, world'
            });

            this.notebooks = new Notebooks();
            this.notebooks.add(this.notebook);
            this.notebooks.add(this.secondNotebook);
        },

        teardown: function () {
            window.errors = null;
        }
    });

    test('Has the Notebook model', function () {
        equal(this.notebooks.model, Notebook);
    });

    test('Notebooks is added to collection', function () {
        equal(this.notebooks.length, 2);
    });

    test('Uses localStorage', function () {
        var storage = new Store('vimarkable.notebooks');
        equal(this.notebooks.localStorage.name, storage.name);
    });


});
