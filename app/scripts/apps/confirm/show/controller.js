/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/confirm/show/view'
], function(_, Marionette, Radio, View) {
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
            if (typeof options === 'string') {
                options = {content: options};
            }

            // If instead of text a view was provided, render it
            if (typeof options.content === 'object') {
                options.content = options.content.render().$el.html();
            }
            // Try to make HTML from supposedly Markdown string
            else {
                options.content = Radio.request('editor', 'content:html', options.content);
            }

            this.options = options;
            this.show();
        },

        onDestroy: function() {
            this.stopListening(this.view);
            this.view.trigger('destroy');
        },

        show: function() {
            // Instantiate a view
            this.view = new View(this.options);
            Radio.command('global', 'region:show', 'modal', this.view);

            // Events
            this.listenTo(this.view, 'click', this.triggerEvent);
        },

        triggerEvent: function(event) {
            if (this.options['on' + event]) {
                this.options['on' + event]();
            }
            Radio.trigger('Confirm', event);

            // Stop itself
            Radio.command('Confirm', 'stop');
        }

    });

    return Controller;
});
