/*global define*/
/*global test*/
/*global equal*/
define([
    'backbone',
    'models/tag',
    'collections/tags',
    'localStorage'
], function (Backbone, Tag, Tags, Store) {
    'use strict';

    module('Tags collection', {
        setup: function () {
            this.tags = new Tags();

            this.tag = new Tag({
                id: this.tags.nextOrder()
            });
            this.tags.add(this.tag);

            this.secondTag = new Tag({
                name: 'Hello, world',
                id: this.tags.nextOrder()
            });
            this.tags.add(this.secondTag);
        },

        teardown: function () {
            window.errors = null;
        }
    });

    test('Can generate right order numbers', function () {
        var tag = new Tag({
            id: this.tags.nextOrder()
        });
        equal(tag.get('id'), 3);
    });

    test('Has the Tag model', function () {
        equal(this.tags.model, Tag);
    });

    test('Tag is added to collection', function () {
        equal(this.tags.length, 2);
    });

    test('Uses localStorage', function () {
        var storage = new Store('vimarkable.tags');
        equal(this.tags.localStorage.name, storage.name);
    });


});
