/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, Modernizr */
define([
    'underscore',
	'i18next',
    'marionette',
    'backbone.radio',
    'behaviors/modalForm',
    'dropzone',
    'text!modules/fileDialog/templates/dialog.html',
    'text!modules/fileDialog/templates/dropzone.html'
], function(_, i18n, Marionette, Radio, ModalForm, Dropzone, Tmpl, dropzoneTmpl) {
    'use strict';

    /**
     * File dialog view.
     */
    var View = Marionette.ItemView.extend({
        template  : _.template(Tmpl),
        className : 'modal fade',

        behaviors: {
            ModalForm: {
                behaviorClass : ModalForm,
                uiFocus       : 'url'
            }
        },

        ui: {
            url    : '[name=url]',
            okBtn  : '#ok-btn',
            attach : '#btn-attach'
        },

        events: {
            'keyup @ui.url' : 'toggleAttachBtn',
            'click .attach-file': 'attachFile'
        },

        initialize: function() {
            this.files = [];
            this.listenTo(this, 'shown.modal', this.onShown);
        },

        attachFile: function(e) {
            e.preventDefault();
            this.trigger('save', true);
        },

        toggleAttachBtn: _.debounce(function() {
            this.ui.okBtn.toggleClass('hidden', this.ui.url.val().trim() !== '');
            this.ui.attach.toggleClass('hidden', this.ui.url.val().trim() === '');
        }, 250),

        onShown: function() {

            // File uploading is allowed only if either Indexeddb or WebSQL is supported
            if (Modernizr.indexeddb || Modernizr.websqldatabase) {
                new Dropzone('.dropzone', {
                    url             : '/#notes',
                    clickable       : true,
                    accept          : _.bind(this.getImage, this),
                    thumbnailWidth  : 100,
                    thumbnailHeight : 100,
                    previewTemplate: dropzoneTmpl,
					dictDefaultMessage: i18n.t('Drop files')
                });
            }
        },

        /**
         * Save file data to a variable.
         */
        getImage: function(file) {
            var reader = new FileReader();

            this.ui.url.val('').trigger('keyup');

            reader.onload = _.bind(function(evt) {
                this.files.push({
                    name     : file.name,
                    src      : evt.target.result,
                    fileType : file.type
                });
            }, this);

            reader.readAsDataURL(file);
        }

    });

    return View;
});
