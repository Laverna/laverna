/* global define */
define([
    'underscore',
    'marionette',
    'sjcl',
    'constants',
    'text!locales/locales.json',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/basic.html'
], function (_, Marionette, sjcl, constants, locales, FormBehavior, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior
            }
        },

        ui: {
            saltInput : 'input[name=encryptSalt]'
        },

        events: {
            'click #randomize'    : 'randomize'
        },

        /**
         * Generate random salt
         */
        randomize: function () {
            var random = sjcl.random.randomWords(2, 0);
            this.ui.saltInput.val(random);
            this.ui.saltInput.trigger('change');
            return false;
        },

        serializeData: function () {
            return {
                locales: JSON.parse(locales),
                models : this.collection.getConfigs(),
                dropboxKeyNeed : constants.DROPBOXKEYNEED
            };
        },

        templateHelpers: function () {
            return {
                isLocaleActive: function (locale) {
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
