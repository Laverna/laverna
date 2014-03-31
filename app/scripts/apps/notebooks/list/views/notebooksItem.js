/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notebooks/list/templates/notebooksItem.html'
], function (_, App, Marionette, Templ) {
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
            var data = this.model.toJSON();
            data.name = App.Encryption.API.decrypt(data.name);

            return data;
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
