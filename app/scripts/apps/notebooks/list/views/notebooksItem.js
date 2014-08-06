/* global define */
define([
    'underscore',
    'marionette',
    'text!apps/notebooks/list/templates/notebooksItem.html'
], function (_, Marionette, Templ) {
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
            return _.extend(this.model.decrypt(), {
                uri  : this.options.uri
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
