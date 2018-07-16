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
    'mathjax',
], (_, Q, MathJax) => {
    'use strict';

    const MathHelper = {

        /**
         * Render MathJax.
         */
        render(view) {

            this.view = view || this.view;
            const $divs = this.view.$el.find('.math');

            // Don't bother with processing MathJax
            if (!$divs.length) {
                return;
            }

            return this.preProcess($divs)
            .then(() => {
                MathJax.Hub.Queue(['Typeset', MathJax.Hub, $divs.toArray()]);
            })
            .fail(e => {
                console.error('MathJax Error:', e);
            });
        },

        /**
         * Process MathJax expressions.
         */
        preProcess($divs) {
            let groups   = [],
                promises = [],
                defer,
                ng;

            /**
             * Divide divs into groups of 5 elements in order to
             * preprocess MathJax later.
             */
            $divs.each((i, val) => {
                ng = Math.trunc(i / 5);
                groups[ng] = groups[ng] || [];
                groups[ng].push(val);
            });

            _.each(groups, group => {
                promises.push(() => {
                    defer = Q.defer();
                    MathJax.Hub.PreProcess(group, () => {
                        defer.resolve();
                    });

                    return defer.promise;
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(() => {
                promises = null;
                defer    = null;
                groups   = null;

                return;
            });
        },

    };

    return MathHelper;
});
