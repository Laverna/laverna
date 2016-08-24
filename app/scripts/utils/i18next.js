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
    'jquery',
    'q',
    'backbone.radio',
    'i18next',
    'i18nextXHRBackend',
    'text!locales/locales.json'
], function(_, $, Q, Radio, i18n, XHR, locales) {
    'use strict';

    var __ = {

        /**
         * Initialize i18next
         */
        init: function() {
            var defer = Q.defer();
            $.t       = i18n.t.bind(i18n);

            i18n
            .use(XHR)
            .init(
                {
                    lng          : __.getLang(),
                    fallbackLng  : ['en'],
                    ns           : [''],
                    defaultNS    : '',
                    backend      : {
                        loadPath : 'locales/{{lng}}/translation.json'
                    },
                },
                function() {
                    defer.resolve();
                }
            );

            return defer.promise;
        },

        /**
         * Get language either from configs or
         * autodetect it from browser settings.
         */
        getLang: function() {
            var lng = Radio.request('configs', 'get:config', 'appLang');

            if (lng || typeof window.navigator === 'undefined') {
                return lng;
            }

            // Language keys in navigator
            lng     = ['languages', 'language', 'userLanguage', 'browserLanguage'];

            // Available locales
            locales = _.keys(JSON.parse(locales));

            return _.chain(window.navigator)
            .pick(lng)
            .values()
            .flatten()
            .compact()
            .map(function(key) {
                return key.replace('-', '_').toLowerCase();
            })
            .find(function(key) {
                return _.contains(locales, key);
            })
            .value();
        },

    };

    /**
     * Init i18next on `app:before` initialize request.
     */
    Radio.request('init', 'add', 'app:before', __.init);

    return __;

});
