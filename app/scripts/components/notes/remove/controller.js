/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
     * 2. channel: `notes`, request: `remove`
     * 3. channel: `Confirm`, request: `start`
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
            this.listenTo(Radio.channel('notes'), 'destroy:model', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'cancel', this.destroy);
            this.listenTo(Radio.channel('Confirm'), 'confirm', this.remove);

            // Fetch the note by ID
            var self = this;
            Radio.request('notes', 'get:model', options)
            .then(function(model){
                // Delete note without dialog when new note was canceled
                if(self.options.deleteDirect){
                    Radio.request('notes', 'remove',model);
                }
                // Or else show the dialog
                else{
                    self.showConfirm(model);
                }
            });
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
