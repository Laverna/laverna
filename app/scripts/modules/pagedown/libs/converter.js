/* global define, Markdown */
define([
    'underscore',
    'backbone.radio',
    'libs/checklist',
    'libs/tags',
    'pagedown-extra'
], function(_, Radio, Checklist, Tags) {
    'use strict';

    /**
     * Converts Markdown to HTML
     */
    var Converter = {
        getConverter : function() {
            var converter = new Markdown.Converter();
            Markdown.Extra.init(converter);

            // Customize Markdown converter
            converter.hooks.chain('postNormalization', function(text) {
                text = new Checklist().toHtml(text);
                text = new Tags().toHtml(text);
                return text;
            });

            Radio.trigger('editor', 'converter:init', converter);
            return converter;
        },

        countTasks: function(content) {
            return new Checklist().count(content);
        },

        getTags: function(content) {
            return new Tags().getTags(content);
        },

        toHtml: function(content) {
            return this.getConverter().makeHtml(content);
        },

        toggleTask: function(data) {
            return new Checklist().toggle(data.content, data.taskId);
        }
    };

    return Converter;
});
