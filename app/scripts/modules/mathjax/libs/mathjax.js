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
    'q',
    'mathjax'
], function(_, Q, MathJax) {
    'use strict';

    var MathHelper = {

        /**
         * Render MathJax.
         */
        render: function(view) {
            var $divs;

            this.view = view || this.view;
            $divs = this.view.$el.find('.math');

            // Don't bother with processing MathJax
            if (!$divs.length) {
                return;
            }

            return this.preProcess($divs)
            .then(function() {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, $divs.toArray()]);
            })
            .fail(function(e) {
                console.error('MathJax Error:', e);
            });
        },

        /**
         * Process MathJax expressions.
         */
        preProcess: function($divs) {
            var groups   = [],
                promises = [],
                defer,
                ng;

            /**
             * Divide divs into groups of 5 elements in order to
             * preprocess MathJax later.
             */
            $divs.each(function(i, val) {
                ng = Math.trunc(i / 5);
                groups[ng] = groups[ng] || [];
                groups[ng].push(val);
            });

            _.each(groups, function(group) {
                promises.push(function() {
                    defer = Q.defer();
                    MathJax.Hub.PreProcess(group, function() {
                        defer.resolve();
                    });

                    return defer.promise;
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                promises = null;
                defer    = null;
                groups   = null;

                return;
            });
        },

    };

    return MathHelper;
});
