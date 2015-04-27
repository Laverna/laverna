/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio'
], function($, _, Marionette, Radio) {
    'use strict';

    /**
     * Title helper. It is used to build title from provided arguments and
     * to change document title.
     *
     * Replies to:
     * 1. channel: `global`, request: `get:title`
     *
     * Complies to:
     * 1. channel: `global`, command: `set:title`
     */
    var Controller = Marionette.Object.extend({

        title: {
            page : '',
            main : '',
            app  : 'Laverna'
        },

        initialize: function() {
            _.bindAll(this, '_makeTitle');

            this.vent = Radio.channel('global');
            this.vent.reply('get:title', this.getTitle, this);
            this.vent.comply('set:title', this.setTitle, this);
        },

        onDestroy: function() {
            this.vent
            .stopReplying('get:title')
            .stopComplying('set:title');
        },

        /**
         * Updates document title.
         */
        setTitle: function(title, type) {
            /*
             * If main title needs to be changed, it probably means
             * that a user is not browsing a note. And that means we
             * need to reset page title.
             */
            if (type === 'main' && this.title.main !== '') {
                this.title.page = '';
            }

            type = type || 'page';
            this.title[type] = title;

            // Prepare an array of titles and remove empty ones
            title = _.compact(_.values(this.title));
            document.title = title.join(' - ');
        },

        getTitle: function(args) {
            var defer = $.Deferred();

            // Filter has additional logic
            if (args.query && this['_' + args.filter + 'Title']) {
                $.when(
                    this['_' + args.filter + 'Title'](args)
                )
                .then(this._makeTitle)
                .then(defer.resolve);
            }
            else {
                defer.resolve(this._makeTitle(args));
            }

            return defer.promise();
        },

        _makeTitle: function(args) {
            // Translate the title to other languages
            var title = args.title || (args.filter || 'All notes');
            title = $.t(title.substr(0, 1).toUpperCase() + title.substr(1));

            if (!args.title && args.query && args.filter !== 'search') {
                title = args.query;
            }

            // Change document.title and return the title
            this.vent.command('set:title', title, 'main');
            return title;
        },

        /**
         * Use notebook name as a title instead of ID.
         */
        _notebookTitle: function(args) {
            var defer = $.Deferred();
            args.id = args.query;

            Radio.request('notebooks', 'get:model', args)
            .then(function(model) {
                args.title = model.get('name');
                defer.resolve(args);
            });

            return defer.promise();
        }

    });

    Radio.command('init', 'add', 'app:before', function() {
        new Controller();
    });

    return Controller;
});
