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
    'q',
    'marionette',
    'backbone.radio',
    'apps/confirm/show/view'
], function(_, Q, Marionette, Radio, View) {
    'use strict';

    /**
     * Confirm controller.
     *
     * For default it triggers the following events on `Confirm` channel:
     * 1. `confirm` - when a user clicks on "OK" button.
     * 2. `cancel`  - when a user clicks on "Cancel" button.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            var self = this;

            if (typeof options === 'string') {
                options = {content: options};
            }

            this.options = options;
            new Q((function() {

                // If instead of text a view was provided, render it
                if (typeof options.content === 'object') {
                    return options.content.render().$el.html();
                }

                // Try to make HTML from supposedly Markdown string
                return Radio.request('markdown', 'render', options.content);
            })())
            .then(function(content) {
                self.options.content = content;
                return self.show();
            });

        },

        onDestroy: function() {
            this.stopListening(this.view);
            this.view.trigger('destroy');
        },

        show: function() {
            // Instantiate a view
            this.view = new View(this.options);
            Radio.request('global', 'region:show', 'modal', this.view);

            // Events
            this.listenTo(this.view, 'click', this.triggerEvent);
        },

        triggerEvent: function(event) {
            if (this.options['on' + event]) {
                this.options['on' + event]();
            }
            Radio.trigger('Confirm', event);

            // Stop itself
            Radio.request('Confirm', 'stop');
        }

    });

    return Controller;
});
