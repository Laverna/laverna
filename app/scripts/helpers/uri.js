/*global define*/
define([
    'underscore'
], function (_) {
    'use strict';

    /**
     * Builds URI
     */
    var URI = {

        // Builds note\'s hash URI
        note: function (opt, note) {
            var args = _.clone(opt),
                url = '/notes',
                filters = {
                    filter : '/f/',
                    query  : '/q/',
                    page   : '/p'
                };

            if (args.profile) {
                url = '/p/' + args.profile + '/notes';
            }

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

            return url;
        },

        notebooks: function ( ) {
        }

    };

    return URI;
});
