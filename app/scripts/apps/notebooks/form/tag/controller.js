/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/notebooks/form/tag/formView'
], function($, _, Marionette, Radio, View) {
    'use strict';

    /**
     * Tag form controller.
     *
     * Listens to events:
     * 1. channel: `tags`, event: `save:after`
     *    triggers `close` event on the view.
     * 2. this.view, event: `save`
     *    saves the changes.
     * 3. this.view, event: `redirect`
     *    stops the module and redirects.
     *
     * Commands:
     * 1. channel: `tags`, event: `save`
     * 2. channel: `uri`, event: `back`
     * 3. channel: `appNotebooks`, event: `form:stop`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            _.bindAll(this, 'show');

            // Events
            this.listenTo(Radio.channel('tags'), 'save:after', this.onSaveAfter);

            // Fetch the model and render the view
            $.when(Radio.request('tags', 'get:model', options))
            .then(this.show);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.command('global', 'region:empty', 'modal');
        },

        show: function(model) {
            // Instantiate and show the form view
            this.view = new View({
                model: model
            });

            Radio.command('global', 'region:show', 'modal', this.view);

            // Listen to events
            this.listenTo(this.view, 'save'    , this.save);
            this.listenTo(this.view, 'redirect', this.redirect);
        },

        save: function() {
            var data = {
                name: this.view.ui.name.val().trim()
            };

            Radio.command('tags', 'save', this.view.model, data);
        },

        onSaveAfter: function() {
            this.view.trigger('close');
        },

        redirect: function() {
            Radio.command('appNotebooks', 'form:stop');

            Radio.command('uri', 'back', '/notebooks', {
                includeProfile : true
            });
        }

    });

    return Controller;
});
