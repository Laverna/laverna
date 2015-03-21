/* global define, Markdown */
define([
    'underscore',
    'libs/checklist',
    'libs/tags',
    'pagedown-extra'
], function(_, Checklist, Tags) {
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

            return converter;
        },

        countTasks: function(content) {
            return new Checklist().count(content);
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
