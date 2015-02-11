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
            _.bindAll(this, 'show', 'filter');
            this.filter(options);
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

        filter: function(options) {
            this.options = options;
            var method = (options && options.filter ? 'filter' : 'all'),
                getNotes = channel.request('notes:' + method, options);

            getNotes.then(this.show);
        }

    });

    return Controller;
});
