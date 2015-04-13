/*global define*/
define([
    'underscore',
    'backbone.radio',
    'marionette'
], function(_, Radio, Marionette) {
    'use strict';

    /**
     * A controller which removes a note.
     *
     * Requests:
     * 1. channel: `notes`, request: `get:model`
     *    expects to receive a model with provided ID
     *
     * Commands:
     * 1. channel: `notes`, request: `remove`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;
            _.bindAll(this, 'remove');

            this.listenTo(Radio.channel('notes'), 'model:destroy', this.destroy);

            // Fetch the note by ID
            Radio.request('notes', 'get:model', options.id)
            .then(this.remove);
        },

        remove: function(model) {
            Radio.command('notes', 'remove', model);
        }

    });

    return Controller;
});
