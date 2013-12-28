/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notebooks/list/templates/tagsItem.html'
], function (_, App, Marionette, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'list-group-tag',

        initialize: function () {
            this.model.on('active', this.changeFocus, this);
        },

        changeFocus: function () {
            this.$('.list-group-item').addClass('active');

            $('#sidebar .ui-s-content').scrollTop(
                this.$('.list-group-item').offset().top -
                $('#sidebar .ui-s-content').offset().top +
                $('#sidebar .ui-s-content').scrollTop() - 100
            );
        }

    });

    return View;
});
