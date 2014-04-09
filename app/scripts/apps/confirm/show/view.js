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

        ui : {
            'confirm': '.confirm',
            'refuse' : '.refuse',
        },

        events: {
            'click @ui.confirm' : 'confirm',
            'click @ui.refuse'  : 'refuse'
        },

        initialize: function () {
            _.bindAll(this, 'keyupEvents');
            this.on('hidden.modal', this.refuseOnHide);
            this.on('shown.modal', this.confirmFocus, this);
        },

        confirmFocus: function () {
            var $focus = this.ui.confirm,
                text = this.options.text;

            if (typeof text === 'object') {
                text.trigger('shown.modal');
                $focus = (text.focusEl) ? this.$(text.focusEl) : $focus;
            }

            $focus.trigger('focus');

            if ($focus.hasClass('form-control')) {
                $focus.select();
                $focus.on('keyup', this.keyupEvents);
            }
        },

        keyupEvents: function (e) {
            switch (e.which) {
                // Refuse on Esc
                case 27:
                    this.ui.refuse.click();
                    break;
                // Confirm on Enter
                case 13:
                    this.ui.confirm.click();
                    break;
            }
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
