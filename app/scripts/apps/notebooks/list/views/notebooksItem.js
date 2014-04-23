/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'text!apps/notebooks/list/templates/notebooksItem.html'
], function (_, App, Marionette, URI, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'list-group-tag',

        initialize: function () {
            this.model.on('active', this.changeFocus, this);
        },

        changeFocus: function () {
            this.$('.list-group-item[data-id=' + this.model.get('id') + ']').addClass('active');

            $('#sidebar .ui-body').scrollTop(
                this.$('.list-group-item').offset().top -
                $('#sidebar .ui-body').offset().top +
                $('#sidebar .ui-body').scrollTop() - 100
            );
        },

        serializeData: function ( ) {
            return _.extend(this.model.toJSON(), {
                name : App.Encryption.API.decrypt(this.model.get('name')),
                uri  : URI.link('')
            });
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
