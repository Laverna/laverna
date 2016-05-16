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
    'backbone.radio',
    'i18next'
], function(_, $, Radio, i18n) {
    'use strict';

    /**
     * Init i18next
     */
    Radio.request('init', 'add', 'app:before', function() {
        return i18n.init({
            lng             : Radio.request('configs', 'get:config', 'appLang'),
            fallbackLng     : 'en',
            useCookie       : false,
            useLocalStorage : false
        });
    });
});
