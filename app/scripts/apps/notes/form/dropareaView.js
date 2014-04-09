/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'marionette',
    'text!apps/notes/form/templates/droparea.html',
    'dropzone'
], function (_, $, App, Backbone, Marionette, Templ, Dropzone) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        focusEl: '#imageLink',

        ui: {
            'input': 'input[type="file"]',
            'imageLink': '#imageLink'
        },

        initialize: function () {
            this.images = [];
            this.imageLink = null;
            this.on('shown.modal', this.showDroparea, this);
            this.on('shown.modal', this.bindEvents, this);
        },

        bindEvents: function () {
            var self = this;

            this.ui.imageLink = $('#imageLink');
            this.ui.imageLink.on('change', function () {
                self.setImageURL();
            });
        },

        setImageURL: function () {
            this.imageLink = this.ui.imageLink.val();
        },

        getImage: function (file, done) {
            var reader = new FileReader(),
                self = this;

            if (App.isMobile && this.images.length >= 1) {
                this.images = [];
                $('.dz-preview')[0].remove();
            }

            reader.onload = function (event) {
                self.images.push({
                    src: event.target.result,
                    type: file.type
                });
                var image = new Image();
                image.src = event.target.result;
                image.width = 250; // a fake resize
            };

            reader.readAsDataURL(file);
        },

        showDroparea: function () {
            _.bindAll(this, 'getImage');
            var dropzone =  new Dropzone('.dropzone', {
                url: '/#notes',
                maxFiles: (App.isMobile) ? 1 : undefined,
                accept: this.getImage,
                thumbnailWidth: 100,
                thumbnailHeight: 100,
                previewTemplate: '<div class=\"dz-preview dz-file-preview\">\n <div class=\"dz-details\">\n <img data-dz-thumbnail class="img-responsive img-thumbnail" />\n  </div>\n </div>\n',
            });
        },

        templateHelpers: function() {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
