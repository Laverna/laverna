/*global define*/
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    /**
     * Builds URI's
     */
    var URI = {
        getProfile: function () {
            var route = Backbone.history.fragment,
                uri = route.split('/');

            if (_.contains(uri, 'p')) {
                return uri[1];
            }
            else {
                return null;
            }
        },

        link: function (uri, profile) {
            if (profile) {
                uri = '/p/' + profile + uri;
            }
            // Search in window's hash (only if 2-nd argument doesn't exist
            else if (arguments.length === 1 && (profile = URI.getProfile()) ) {
                uri = '/p/' + profile + uri;
            }
            return uri;
        },

        // Builds note\'s hash URI
        note: function (opt, note) {
            var args = _.clone(opt),
                url = '/notes',
                filters = {
                    filter : '/f/',
                    query  : '/q/',
                    page   : '/p'
                };

            args.page = (typeof note === 'number') ? note : args.page;
            if (isNaN(args.page)) {
                args.page = 0;
            }

            _.each(filters, function (value, filter) {
                if (_.has(args, filter) && args[filter] !== null) {
                    url += value + args[filter];
                }
            });

            // Note
            if (note && _.isObject(note)) {
                url += '/show/' + ( note.id || note.get('id') );
            }

            return this.link(url, args.profile);
        }

    };

    return URI;
});
