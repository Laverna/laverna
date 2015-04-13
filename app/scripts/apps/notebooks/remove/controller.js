/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio'
], function(_, Marionette, Radio) {
    'use strict';

    /**
     * Remove controller. Handles removing of notebooks and tags.
     *
     * Listens to events on channel `[notebooks|tags]`:
     * 1. event: `model:destroy`
     *
     * Commands to channel `[notebooks|tags]`:
     * 1. `remove` - expects that the model will be destroyed.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(modelType, profile, id) {
            _.bindAll(this, 'remove');

            this.channel = Radio.channel(modelType);
            profile = profile || Radio.request('uri', 'profile');

            // When the model is destroyed, destroy this controller
            this.listenTo(this.channel, 'model:destroy', this.destroy);

            // Fetch the note by ID
            this.channel.request('get:model', {profile: profile, id: id})
            .then(this.remove);
        },

        onDestroy: function() {
            this.stopListening();
            delete this.channel;
        },

        remove: function(model) {
            this.channel.command('remove', model);
        }

    });

    return Controller;
});
