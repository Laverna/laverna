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
    'backbone.radio'
], function(_, Radio) {
    'use strict';

    var Helper = {
        data: {urls: []},

        /**
         * Replace all file links with generated URIs
         *
         * @var string text
         * @var array files an array of IDs
         */
        toHtml: function(text, model) {
            // If the note doesn't have attached files, revoke URLs and return text
            if (!model.files.length) {
                this.revokeUrls();
                return text;
            }

            // If it is not the same note model, revoke URLs
            if (model.id !== this.data.id) {
                this.revokeUrls();
            }

            var url,
                pattern;

            this.data.id = model.id;

            _.each(model.files, function(fModel) {
                url = this._generateUrl(fModel);

                /*
                 * Replace colons in the URL to prevent Pagedown from converting it
                 * to a link.
                 */
                url = url.replace(/:(?!http)/, '&#58;');

                // Replace fake URLs with real ones
                pattern = new RegExp('#file:' + fModel.id, 'g');
                text    = text.replace(pattern, url);

            }, this);

            return text;
        },

        /**
         * Parse the text for file IDs
         * @var string text
         */
        getFileIds: function(text) {
            if (text === '') {
                return text;
            }

            var ids     = [],
                results = text.match(/#file:([a-z0-9\-])+/g);

            // Remove duplicate IDs
            results = _.uniq(results);

            _.each(results, function(res) {
                ids.push(
                    res.replace('#file:', '')
                );
            });

            return ids;
        },

        /**
         * Revoke object URLs
         */
        revokeUrls: function() {
            var url = window.URL || window.webkitURL;

            _.each(this.data.urls, function(link) {
                url.revokeObjectURL(link);
            });

            this.data = {urls: []};
        },

        /**
         * Generate object URL to a file.
         */
        _generateUrl: function(fModel) {
            // Do not generate URLs every time
            var url = _.findWhere(this.data.urls, {id: fModel.id});
            if (url) {
                return url.url;
            }

            url = Radio.request('uri', 'link:file', fModel, true);
            this.data.urls.push({
                id  : fModel.id,
                url : url
            });
            return url;
        }

    };

    return Helper;
});
