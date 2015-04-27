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

        triggers: {
            'click .cancelBtn' : 'cancel',
            'click .saveBtn'   : 'save'
        },

        serializeData: function() {
            return this.options;
        }
    });

    return View;
});
