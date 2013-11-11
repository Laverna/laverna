/*global define*/
/*global test*/
/*global equal*/
// /*global notDeepEqual*/
define(['models/notebook', 'collections/notebooks', 'backbone', 'localStorage'],
function (Notebook, Notebooks, Backbone, Store) {
    'use strict';

    module('Notebooks collection', {
        setup: function () {
            this.notebooks = new Notebooks();

            this.notebook = new Notebook({
                order: this.notebooks.nextOrder()
            });
            this.notebooks.add(this.notebook);

            this.secondNotebook = new Notebook({
                name: 'Hello, world',
                order: this.notebooks.nextOrder()
            });
            this.notebooks.add(this.secondNotebook);
        },

        teardown: function () {
            window.errors = null;
        }
    });

    test('Can generate right order numbers', function () {
        var notebook = new Notebook({
            order: this.notebooks.nextOrder()
        });
        equal(notebook.get('order'), 3);
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
