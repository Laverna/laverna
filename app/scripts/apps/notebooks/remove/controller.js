/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
     * 1. event: `destroy:model`
     *
     * requests:
     * 1. channel: [notebooks|tags], request: `remove`
     *    expects that the model will be destroyed.
     * 2. channel: `Confirm`, request: `start`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(modelType, profile, id) {
            _.bindAll(this, 'showConfirm');

            this.channel = Radio.channel(modelType);
            profile = profile || Radio.request('uri', 'profile');

            // Events
            this.listenTo(this.channel, 'destroy:model', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'cancel', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'confirm', this.remove);
            this.listenTo(Radio.channel('Confirm'), 'confirmNotes', this.removeWithNotes);

            // Fetch a tag or a notebook by ID
            this.channel.request('get:model', {profile: profile, id: id})
            .then(this.showConfirm);
        },

        onDestroy: function() {
            this.stopListening();
            this.channel = null;
        },

        showConfirm: function(model) {
            this.model = model;

            Radio.request('Confirm', 'start', {
                content : $.t(model.storeName + '.confirm remove', model.toJSON()),
                template: model.storeName === 'notebooks' ? Tmpl : undefined
            });
        },

        remove: function() {
            this.channel.request('remove', this.model, {profile: this.model.profileId}, false);
        },

        removeWithNotes: function() {
            this.channel.request('remove', this.model, {profile: this.model.profileId}, true);
        }

    });

    return Controller;
});
