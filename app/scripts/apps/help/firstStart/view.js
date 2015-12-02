/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/modal',
    'text!apps/help/firstStart/template.html'
], function ( _, $, Marionette, ModalBehavior, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        behaviors: {
            ModalBehavior: {
                behaviorClass: ModalBehavior
            }
        },

        ui: {
            'settings'     : '#welcome--settings',
            'page'         : '#welcome--page',
            'backup'       : '#welcome--backup',
            'password'     : 'input[name="password"]',
            'cloudStorage' : 'select[name="cloudStorage"]'
        },

        triggers: {
            'click #welcome--import' : 'import',
            'click #welcome--save'   : 'save',
            'click #welcome--last'   : 'close',
            'click #welcome--export' : 'download',
        },

        events: {
            'click #welcome--next': 'onNext',
        },

        initialize: function() {
            this.listenTo(this, 'save:after', this.onSave);
        },

        onNext: function() {
            this.ui.page.addClass('hidden');
            this.ui.settings.removeClass('hidden');
        },

        onSave: function() {
            this.ui.settings.addClass('hidden');
            this.ui.backup.removeClass('hidden');
        },

    });

    return View;
});
