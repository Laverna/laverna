/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'marionette',
    'text!apps/notes/form/templates/droparea.html',
    'dropzone'
], function (_, $, App, Backbone, Marionette, Templ, dropzone) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        images: [],

        ui: {
            'input': 'input[type="file"]'
        },

        initialize: function () {
            this.on('shown.modal', this.showDroparea, this);
        },

        getImage: function (file, done) {
            var reader = new FileReader(),
                self = this;

            reader.onload = function (event) {
                self.images.push({
                    src: event.target.result,
                    type: file.type
                });
                console.log(self.images);
                var image = new Image();
                image.src = event.target.result;
                image.width = 250; // a fake resize
            };

            reader.readAsDataURL(file);
        },

        showDroparea: function () {
            _.bindAll(this, 'getImage');
            $('.dropzone').dropzone({
                url: '/#notes',
                accept: this.getImage,
                thumbnailWidth: 100,
                thumbnailHeight: 100,
                previewTemplate: '<div class=\"dz-preview dz-file-preview\">\n <div class=\"dz-details\">\n <img data-dz-thumbnail class="img-responsive img-thumbnail" />\n  </div>\n </div>\n'
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
