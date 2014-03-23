/*global define*/
/*global Markdown*/
define([
    'underscore',
    'jquery',
    'marionette',
    'text!apps/confirm/show/template.html',
    'pagedown-ace'
], function ( _, $, Marionette, Tmpl) {
    'use strict';

    /**
     * Confirm View
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        events: {
            'click .confirm' : 'confirm',
            'click .refuse'  : 'refuse'
        },

        initialize: function () {
            this.on('hidden.modal', this.refuseOnHide);
            this.on('shown.modal', this.confirmFocus, this);
        },

        confirmFocus: function () {
            if (typeof this.options.text === 'object') {
                this.options.text.trigger('shown.modal');
            }
            this.$('.confirm').trigger('focus');
        },

        serializeData: function () {
            var converter = new Markdown.Converter(),
                content = this.options.text;

            if (typeof content === 'object') {
                content = content.render().$el.html();
            } else {
                content = converter.makeHtml(content);
            }

            return {
                text: content
            };
        },

        refuseOnHide: function () {
            // Trigger only once
            if (this.answered !== true) {
                this.trigger('refuse');
            }
        },

        refuse: function () {
            this.trigger('refuse');
            this.close();
        },

        confirm: function () {
            this.trigger('confirm');
            this.close();
        },

        close: function () {
            this.answered = true;
            this.trigger('close');
            return false;
        }

    });

    return View;
});
