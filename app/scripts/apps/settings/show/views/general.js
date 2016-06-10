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
    'marionette',
    'backbone.radio',
    'i18next',
    'text!locales/locales.json',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/general.html'
], function(_, Marionette, Radio, i18n, locales, FormBehavior, Tmpl) {
    'use strict';

    /**
     * General settings.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior
            }
        },

        serializeData: function() {
            var appLang = this.collection.get('appLang');
            return {
                locales    : JSON.parse(locales),
                models     : this.collection.getConfigs(),
                appLang    : (appLang.get('value') || i18n.language) || 'en',
                useDefault : this.options.useDefault.toJSON()
            };
        },

        templateHelpers: function() {
            return {
                isDefaultProfile: function() {
                    var profile = Radio.request('uri', 'profile');
                    return _.indexOf([null, 'notes-db'], profile) > -1;
                },

                isLocaleActive: function(locale) {
                    if (this.appLang === locale ||
                        this.appLang.search(locale) >= 0) {
                        return ' selected';
                    }
                }
            };
        }
    });

    return View;
});
