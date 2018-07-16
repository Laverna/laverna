/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requireNode */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!modules/fs/templates/settings.html',
], (_, Marionette, Radio, Tmpl) => {
    'use strict';

    /**
     * Shows FS module's configs.
     */
    const dialog = requireNode('electron').remote.dialog;
        
    const View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            input: '.input--fs',
        },

        events : {
            'click .btn--fs': 'showFolderDialog',
        },

        initialize() {
        },

        serializeData() {
            return {
                models: this.collection.getConfigs(),
            };
        },

        showFolderDialog(e) {
            e.preventDefault();

            const folder = dialog.showOpenDialog({properties: ['openDirectory']});

            if (!folder) {
                return;
            }

            this.ui.input.val(folder[0]);

            this.collection.trigger('new:value', {
                name  : 'module:fs:folder',
                value : folder[0],
            });
        },

    });

    return View;
});
