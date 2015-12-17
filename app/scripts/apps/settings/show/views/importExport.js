/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/settings/show/templates/importExport.html'
], function (_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Import or export settings
     */
    var ImportExport = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            importBtn  : '#do-import',
            import     : '#import-file',

            // Export  / import buttons
            importData : '#import-data-file',
            exportData : '#export-data',
        },

        events: {
            'click .btn--import'    : 'triggerClick',
            'change @ui.import'     : 'triggerImport',
            'change @ui.importData' : 'triggerImportData',
            'click @ui.exportData'  : 'triggerExportData'
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

        triggerImportData: function(e) {
            if (!e.target.files.length) {
                return;
            }

            Radio.request('importExport', 'import', e.target.files);
        },

        triggerExportData: function() {
            Radio.request('importExport', 'export');
        },

        triggerClick: function(e) {
            var file = $(e.currentTarget).attr('data-file');
            $(file).click();
        }
    });

    return ImportExport;
});
