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

        link: function (uri, profile) {
            var regx = /p\/[\w\d]+/,
                route = Backbone.history.fragment;

            if (profile) {
                uri = '/p/' + profile + uri;
            }
            // Search in window's hash
            else if (arguments.length > 0 && route.match(regx)) {
                uri = '/' + route.match(regx)[0] + uri;
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
