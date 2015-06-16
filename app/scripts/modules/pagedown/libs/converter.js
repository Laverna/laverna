/* global define, Markdown */
define([
    'underscore',
    'backbone.radio',
    'libs/checklist',
    // 'libs/tags',
    'pagedown-extra'
], function(_, Radio, Checklist) {
    'use strict';

    /**
     * Converts Markdown to HTML
     */
    var Converter = {
        getConverter : function(model) {
            model = typeof model !== 'string' ? model : null;

            var converter = new Markdown.Converter();
            Markdown.Extra.init(converter);

            // Customize Markdown converter
            converter.hooks.chain('postNormalization', function(text) {
                text = new Checklist().toHtml(text);
                return text;
            });

            Radio.trigger('editor', 'converter:init', converter, model);
            return converter;
        },

        countTasks: function(content) {
            return new Checklist().count(content);
        },

        getTags: function(content) {
            return Radio.request('editor', 'get:tags', content);
        },

        toHtml: function(model) {
            var content = (typeof model === 'string' ? model : model.get('content'));
            return this.getConverter(model).makeHtml(content);
        },

        toggleTask: function(data) {
            return new Checklist().toggle(data.content, data.taskId);
        }
    };

    return Converter;
});
