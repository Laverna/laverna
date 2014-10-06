/* global define */
define([
    'underscore',
    'marionette',
    'text!apps/settings/show/templates/importExport.html'
], function (_, Marionette, Tmpl) {
    'use strict';

    var ImportExport = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            importBtn : '#do-import',
            importFile: '#import-file'
        },

        events: {
            'click #do-export'        : 'exportTrigger',
            'click @ui.importBtn'     : 'importTrigger',
            'change @ui.importFile'   : 'importFile'
        },

        exportTrigger: function () {
            this.collection.trigger('export');
        },

        importFile: function (e) {
            this.collection.trigger('import', e.target);
        },

        importTrigger: function () {
            this.ui.importFile.click();
        }
    });

    return ImportExport;
});
