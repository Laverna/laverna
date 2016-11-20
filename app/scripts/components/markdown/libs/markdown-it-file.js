/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, URL, webkitURL */
define([
    'underscore'
], function(_) {
    'use strict';

    /**
     * A Markdown-it plugin which replaces pseudo file locations
     * with generated ObjectURLs.
     */
    var File = {
        pattern: /#file:([a-z0-9\-])+/,

        init: function(md) {
            var origI = md.renderer.rules.image;

            md.renderer.rules.link_open = function(tokens, idx, opt, env, self) { // jshint ignore:line
                File._replaceLink(tokens, idx, opt, env);
                return self.renderToken(tokens, idx, opt);
            };

            md.renderer.rules.image = function(tokens, idx, opt, env, self) {
                File._replaceLink(tokens, idx, opt, env);
                return origI(tokens, idx, opt, env, self);
            };
        },

        /**
         * Revoke all ObjectURLs which aren't under use.
         */
        revokeURLs: function(objectURLs, model) {
            _.each(objectURLs, function(obj, key) {
                if (_.findWhere(model.files, {id: key})) {
                    return;
                }

                (URL || webkitURL).revokeObjectURL(obj);
                delete objectURLs[key];
            });
        },

        /**
         * Replace all pseudo IDs with objectURLs.
         */
        _replaceLink: function(tokens, idx, options, env) {
            var type = (tokens[idx].type === 'image' ? 'src' : 'href'),
                attr = tokens[idx].attrs[tokens[idx].attrIndex(type)];

            if (!File.pattern.test(attr[1])) {
                return;
            }

            var id  = attr[1].match(File.pattern)[0].replace('#file:', '');

            // Add files IDs to env
            if (env) {
                env.files = env.files || [];
                env.files.push(id);
            }

            if (!env.modelData) {
                return;
            }

            File._createURL(attr, id, env);
        },

        /**
         * Create an ObjectURL.
         */
        _createURL: function(attr, id, env) {
            var file = _.findWhere(env.modelData.files, {id: id});

            if (!file) {
                return;
            }

            // Generate a new link only if it wasn't generated before
            var src = env.objectURLs[file.id];
            src     = src || (URL || webkitURL).createObjectURL(file.src);

            env.objectURLs[file.id] = src;
            attr[1] = src;
        },
    };

    return File;

});
