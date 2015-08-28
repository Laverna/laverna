/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/notebooks/remove/notebooks.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Remove controller. Handles removing of notebooks and tags.
     *
     * Listens to events on channel `[notebooks|tags]`:
     * 1. event: `model:destroy`
     *
     * Commands:
     * 1. channel: [notebooks|tags], command: `remove`
     *    expects that the model will be destroyed.
     * 2. channel: `Confirm`, command: `start`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(modelType, profile, id) {
            _.bindAll(this, 'showConfirm');

            this.channel = Radio.channel(modelType);
            profile = profile || Radio.request('uri', 'profile');

            // Events
            this.listenTo(this.channel, 'model:destroy', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'cancel', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'confirm', this.remove);
            this.listenTo(Radio.channel('Confirm'), 'confirmNotes', this.removeWithNotes);

            // Fetch a tag or a notebook by ID
            this.channel.request('get:model', {profile: profile, id: id})
            .then(this.showConfirm);
        },

        onDestroy: function() {
            this.stopListening();
            delete this.channel;
        },

        showConfirm: function(model) {
            this.model = model;

            Radio.command('Confirm', 'start', {
                content : $.t(model.storeName + '.confirm remove', model.toJSON()),
                template: model.storeName === 'notebooks' ? Tmpl : undefined
            });
        },

        remove: function() {
            this.channel.command('remove', this.model);
        },

        removeWithNotes: function() {
            this.channel.command('remove', this.model, true);
        }

    });

    return Controller;
});
