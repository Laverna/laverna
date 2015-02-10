/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'helpers/communicator',
    'apps/notes/list/views/noteSidebar'
], function ($, _, Backbone, Marionette, channel, Sidebar) {
    'use strict';

    /**
     * Notes list controller - shows notes list in sidebar
     */
    var Controller = Marionette.Controller.extend({

        initialize: function(options) {
            var getNotes = channel.request('notes:all');

            _.bindAll(this, 'show');

            this.options = options;
            getNotes.then(this.show);
        },

        onDestroy: function() {
        },

        show: function(notes) {
            var view = new Sidebar({
                collection: notes,
                args      : this.options
            });
            channel.command('region:show', 'sidebar', view);
        },

    });

    return Controller;
});
