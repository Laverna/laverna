/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'text!apps/notebooks/list/templates/tagsItem.html'
], function (_, App, Marionette, URI, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'list-group-tag',

        initialize: function () {
            this.model.on('active', this.changeFocus, this);
        },

        serializeData: function () {
            return _.extend(this.model.toJSON(), {
                uri : URI.link('')
            });
        },

        changeFocus: function () {
            this.$('.list-group-item').addClass('active');

            $('#sidebar .ui-body').scrollTop(
                this.$('.list-group-item').offset().top -
                $('#sidebar .ui-body').offset().top +
                $('#sidebar .ui-body').scrollTop() - 100
            );
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
