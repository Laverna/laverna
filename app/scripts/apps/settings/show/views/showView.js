/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'text!apps/settings/show/templates/showTemplate.html'
], function(_, $, Marionette, Tmpl) {
    'use strict';

    /**
     * Settings layout view
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        regions: {
            content: 'form'
        },

        events: {
            'click .saveBtn'   : 'save'
        },

        triggers: {
            'click .cancelBtn' : 'cancel'
        },

        serializeData: function() {
            return this.options;
        },

        save: function(e) {
            var view = this.content.currentView;
            e.preventDefault();

            /*
             * If the password was autofilled by a user's browser, it usually will
             * not trigger `change` event. This will fix it.
             */
            if (view.ui && view.ui.password) {
                this.content.currentView.ui.password.trigger('change');
            }

            this.trigger('save');
        }
    });

    return View;
});
