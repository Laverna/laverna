/* global define */
define([
    'underscore',
    'marionette',
    'text!apps/settings/show/templates/importExport.html'
], function (_, Marionette, Tmpl) {
    'use strict';

    /**
     * Import or export settings
     */
    var ImportExport = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            importBtn : '#do-import',
            import: '#import-file'
        },

        events: {
            'click @ui.importBtn' : 'triggerClick',
            'change @ui.import'   : 'triggerImport'
        },

        triggers: {
            'click #do-export'  : 'export'
        },

        triggerImport: function(e) {
            if (!e.target.files.length) {
                return;
            }
            this.trigger('import', e.target);
        },

        triggerClick: function () {
            this.ui.import.click();
        }
    });

    return ImportExport;
});
