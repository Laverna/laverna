/* global define */
define([
    'underscore',
    'marionette',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/shortcuts.html'
], function (_, Marionette, FormBehavior, Tmpl) {
    'use strict';

    var Shortcuts = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior
            }
        },

        serializeData: function () {
            return { collection: this.collection };
        },

        templateHelpers: function () {
            return {
                filter: function (str) {
                    return this.collection.filterName(str);
                },

                appShortcuts: function () {
                    return this.collection.appShortcuts();
                }
            };
        }
    });

    return Shortcuts;
});
