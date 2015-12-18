/* global define */
define([
    'underscore',
    'q',
    'marionette',
    'backbone.radio',
    'modules/pagedown/views/editor',
    'modules/pagedown/libs/converter',
    'modules/pagedown/controllers/controller',
    'pagedown/Markdown.Editor',
], function(_, Q, Marionette, Radio, View, Converter, Controller, Editor) {
    'use strict';

    /**
     * Renders textarea version of Pagedown.
     */
    var Pagedown = Controller.extend({
        Editor: Editor,

        initialize: function() {
            _.bindAll(this, 'startEditor', 'changeMode');

            // Call parent initialize method
            _.bind(Controller.prototype.initialize, this)();

            this.listenTo(Radio.channel('notesForm'), 'set:mode', this.changeMode);

            return new Q(this.initMdEditor())
            .then(this.startEditor)
            .fail(function(e) {
                console.error('Markdown editor: error', e);
            });
        },

        startEditor: function() {
            var self = this;

            // Replace div block with textarea
            this.view.ui.input.replaceWith(function() {
                return $('<textarea id="' + self.view.ui.input.attr('id') + '">')
                    .addClass(this.className)
                    .addClass('-textarea');
            });

            this.view.ui.input = $('#' + self.view.ui.input.attr('id'));

            // Listen to scroll event
            this.view.ui.input.on('scroll', function () {
                self.triggerScroll();
            });

            this.view.ui.input.val(this.view.model.get('content'));

            this.mdEditor.run();
            this.changeMode();
        },

        changeMode: function(mode) {
            this.$body = this.$body || $('body');

            if (mode === 'preview') {
                this.$body.removeClass('-pagedown--text');
                return;
            }

            this.$body.addClass('-pagedown--text');
        },

        getContent: function() {
            var data     = {};
            data.content = this.view.ui.input.val().trim();
            data.tags    = Converter.getTags(data.content);
            data.files   = Radio.request('editor', 'get:files', data.content);
            data = _.extend(data, Converter.countTasks(data.content));
            return data;
        },

    });

    return Pagedown;
});
