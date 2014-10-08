/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/modal',
    'text!apps/help/about/template.html'
], function (_, $, Marionette, ModalBehavior, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        behaviors: {
            ModalBehavior: {
                behaviorClass: ModalBehavior
            }
        },

        serializeData: function () {
            return {
                appVersion : this.options.appVersion
            };
        }
    });

    return View;
});
