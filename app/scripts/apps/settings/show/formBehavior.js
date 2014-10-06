/* global define */
define([
    'marionette'
], function (Marionette) {
    'use strict';

    var FormBehavior = Marionette.Behavior.extend({

        events: {
            'change input, select, textarea' : 'triggerChange',
            'change .show-onselect'   : 'showOnSelect',
            'click .showField'        : 'showOnCheck'
        },

        initialize: function () {
            this.view.on('render', this.popover, this);
        },

        popover: function () {
            var pop = this.view.$('.popover-dropbox').html();

            this.view.$('.popover-key').popover({
                trigger: 'click',
                html   : true,
                content: function () { return pop; }
            });
        },

        triggerChange: function (e) {
            var el = $(e.target),
                conf = { name: el.attr('name') };

            if (el.attr('type') !== 'checkbox') {
                conf.value = el.val();
            }
            else {
                conf.value = (el.is(':checked')) ? 1 : 0;
            }

            this.view.collection.trigger('new:value', conf);
        },

        /**
         * Shows additional parameters when option is selected
         */
        showOnSelect: function (e) {
            var $el = $(e.target),
                option = $el.find('option[value=' + $el.attr('data-option') + ']');

            if (option.is(':selected')) {
                $( option.attr('data-show') ).removeClass('hidden');
            }
            else {
                $( option.attr('data-show') ).addClass('hidden');
            }
        },

        /**
         * Shows fieldsets with aditional parameters when checkbox is checked
         */
        showOnCheck: function ( e ) {
            var input = $(e.currentTarget),
                field = $(input.attr('data-field'));

            if ( input.is(':checked') ) {
                field.removeClass('hidden');
            }
            else {
                field.addClass('hidden');
            }
        }
    });

    return FormBehavior;
});
