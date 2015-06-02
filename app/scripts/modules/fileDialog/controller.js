/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules/fileDialog/views/dialog'
], function(_, Marionette, Radio, View) {
    'use strict';

    /**
     * File dialog controller.
     *
     * Requests:
     * 1. channel: `files`, request: `save:all`
     *    in order to save uploaded files.
     * 2. channel: `uri`, request: `link:file`
     *    expects to receive a link to a file.
     * 3. channel: `editor`, request: `generate:link`
     *    expects to receive link code. For example, Markdown code for a link.
     * 4. channel: `editor`, request: `generate:image`
     *    expects to receive image code. For example, Markdown code for an image.
     *
     * Commands:
     * 1. channel: `editor`, command: `insert`
     *    in order to insert some text to the editor.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;

            // Instantiate and show the view
            this.view = new View();
            Radio.command('global', 'region:show', 'modal', this.view);

            // Events
            this.listenTo(this.view, 'save', this.link);
            this.listenTo(this.view, 'redirect', this.destroy);
        },

        onDestroy: function() {
            if (this.options.callback) {
                this.options.callback(null);
            }

            this.stopListening();
            Radio.command('global', 'region:empty', 'modal');
        },

        /**
         * Provide the url to editor callback
         */
        link: function(isFile) {
            var self = this,
                url  = this.view.ui.url.val().trim();

            if (url !== '') {
                var method = (isFile === true ? 'attachFiles' : 'attachImage');
                return this[method](url);
            }

            Radio.request('files', 'save:all', this.view.files, {
                profile: Radio.request('uri', 'profile')
            })
            .then(function(files) {
                self.options.model.files = _.union(self.options.model.files, files);

                // If there is only 1 file and its type is image
                if (files.length === 1 && self.isImage(files[0])) {
                    return self.attachImage(
                        Radio.request('uri', 'link:file', files[0])
                    );
                }

                // Otherwise, we will generate custom Markdown code
                self.attachFiles(files);
            })
            .fail(function() {
                console.error('Error while uploading file:', arguments);
            });
        },

        /**
         * Attach files to the editor.
         */
        attachFiles: function(files) {
            var str = '';

            // It is just a link
            if (typeof files === 'string') {
                str = Radio.request('editor', 'generate:link', {
                    text : 'Alt description',
                    url  : files
                });
            }
            else {
                _.each(files, function(model) {
                    str += this.generateCode(model) + '\n';
                }, this);
            }

            Radio.command('editor', 'insert', str);
            this.attachImage(null);
        },

        attachImage: function(url) {
            this.options.callback(url !== '' ? url : null);

            // Close the dialog
            delete this.options.callback;
            this.destroy();
        },

        isImage: function(model) {
            return (model.get('type').indexOf('image') > -1);
        },

        /**
         * Generate Markdown code.
         */
        generateCode: function(model) {
            var url     = Radio.request('uri', 'link:file', model),
                command = 'link';

            // If file type is an image type, generate image MD code
            if (this.isImage(model)) {
                command = 'image';
            }

            return Radio.request('editor', 'generate:' + command, {
                text : model.get('name'),
                url  : url
            });
        }

    });

    return Controller;
});
