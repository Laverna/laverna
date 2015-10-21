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
     * requests:
     * 1. channel: `notes`, request: `remove`
     * 2. channel: `Confirm`, request: `start`
     */
    var Controller = Marionette.Object.extend({

        labels: [
            'notes.confirm trash',
            'notes.confirm remove'
        ],

        initialize: function(options) {
            this.options = options;
            _.bindAll(this, 'showConfirm');

            // Events
            this.listenTo(Radio.channel('notes'), 'model:destroy', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'cancel', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'confirm', this.remove);

            // Fetch the note by ID
            Radio.request('notes', 'get:model', options)
            .then(this.showConfirm);
        },

        /**
         * Show a confirmation dialog before removing a note.
         */
        showConfirm: function(model) {
            var content = this.labels[Number(model.get('trash'))];
            this.model = model;

            Radio.request('Confirm', 'start', {
                content : $.t(content, model.toJSON())
            });
        },

        remove: function() {
            Radio.request('notes', 'remove', this.model);
        }

    });

    return Controller;
});
