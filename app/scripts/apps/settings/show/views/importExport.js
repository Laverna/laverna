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
