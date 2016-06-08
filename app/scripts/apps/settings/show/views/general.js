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
            return {
                locales    : JSON.parse(locales),
                models     : this.collection.getConfigs(),
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
                    this.models.appLang = this.models.appLang || i18n.language;
                    if (this.models.appLang === locale ||
                        this.models.appLang.indexOf(locale) >= 0) {
                        return ' selected';
                    }
                }
            };
        }
    });

    return View;
});
