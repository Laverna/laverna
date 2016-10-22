/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'marionette',
    'sjcl'
], function(Marionette, sjcl) {
    'use strict';

    /**
     * Default behaviour for settings views.
     */
    var FormBehavior = Marionette.Behavior.extend({

        events: {
            'input input, select, textarea' : 'triggerChange',
            'change input, select, textarea': 'triggerChange',
            'change .show-onselect'   : 'showOnSelect',
            'click .showField'        : 'showOnCheck',
        },

        initialize: function() {
            this.view.on('render', this.popover, this);
        },

        popover: function() {
            var pop = this.view.$('.popover-dropbox').html();

            this.view.$('.popover-key').popover({
                trigger: 'click',
                html   : true,
                content: function() { return pop; }
            });
        },

        triggerChange: function(e) {
            var el   = $(e.target),
                conf = { name: el.attr('name') };

            if (el.attr('type') !== 'checkbox') {
                conf.value = el.val();
            }
            else {
                conf.value = (el.is(':checked')) ? 1 : 0;
            }

            if (el.hasClass('hex') && typeof conf.value === 'string') {
                conf.value = sjcl.codec.hex.toBits(conf.value);
            }

            this.view.collection.trigger('new:value', conf);
        },

        /**
         * Shows additional parameters when option is selected
         */
        showOnSelect: function(e) {
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
        showOnCheck: function(e) {
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
