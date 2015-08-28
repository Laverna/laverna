/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!locales/locales.json',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/general.html'
], function(_, Marionette, Radio, locales, FormBehavior, Tmpl) {
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
                    this.models.appLang = this.models.appLang || 'en';
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
