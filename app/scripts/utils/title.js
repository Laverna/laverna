/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'jquery',
    'q',
    'helpers/underscore-util',
    'marionette',
    'backbone.radio'
], function($, Q, _, Marionette, Radio) {
    'use strict';

    /**
     * Title helper. It is used to build title from provided arguments and
     * to change document title.
     *
     * Replies to:
     * 1. channel: `global`, request: `get:title`
     *
     * Replies to:
     * 1. channel: `global`, request: `set:title`
     */
    var Controller = Marionette.Object.extend({

        title: {
            page : '',
            main : '',
            db   : '',
            app  : 'Laverna'
        },

        initialize: function() {
            _.bindAll(this, '_makeTitle');

            this.title.db = Radio.request('uri', 'profile');
            this.title.db = this.title.db === 'notes-db' ? '' : this.title.db;

            this.vent = Radio.channel('global');
            this.vent.reply('get:title', this.getTitle, this);
            this.vent.reply('set:title', this.setTitle, this);
        },

        onDestroy: function() {
            this.vent
            .stopReplying('get:title set:title');
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
            document.title = _.cleanXSS(title.join(' - '));
        },

        getTitle: function(args) {
            // Filter has additional logic
            if (args.query && this['_' + args.filter + 'Title']) {
                return this['_' + args.filter + 'Title'](args)
                .then(this._makeTitle);
            }
            else {
                return new Q(this._makeTitle(args));
            }
        },

        _makeTitle: function(args) {
            // Translate the title to other languages
            var title = args.title || (args.filter && args.filter !== 'active' ? args.filter : 'All notes');
            title = $.t(title.substr(0, 1).toUpperCase() + title.substr(1));

            if (!args.title && args.query && args.filter !== 'search') {
                title = args.query;
            }

            // Change document.title and return the title
            this.vent.request('set:title', title, 'main');
            return title;
        },

        /**
         * Use notebook name as a title instead of ID.
         */
        _notebookTitle: function(args) {
            args.id = args.query;

            return Radio.request('notebooks', 'get:model', args)
            .then(function(model) {
                args.title = model.get('name');
                return args;
            });
        }

    });

    Radio.request('init', 'add', 'app:before', function() {
        new Controller();
    });

    return Controller;
});
