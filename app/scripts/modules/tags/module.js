/* global define */
define([
    'underscore',
    'backbone.radio',
    'marionette',
    'modules',
    'xregexp/addons/unicode/unicode-categories'
], function(_, Radio, Marionette, Modules, XRegExp) {
    'use strict';

    /**
     * Tag module.
     *
     * Replies to requests on channel `editor`:
     * 1. `get:tags` - searches provided text for tags and returns them.
     *
     * Listens to events:
     * 1. channel: `editor`, event: `converter:init`
     *    adds custom hooks.
     */
    var Tags = {

        /**
         * Prepares the regular expression.
         * For default, every word which begins with # symbol is considered as
         * a tag but the symbol can be modified.
         */
        configure: function() {
            this.symbol = Radio.request('configs', 'get:config', 'tagSymbol', '#');
            this.regex = new XRegExp('(^|[^' + this.symbol + '\\p{L}\\p{N}])' + this.symbol + '([\\p{L}\\p{N}\-\+]+)', 'g');
        },

        /**
         * Search text for words which begin with a special symbol and replace
         * them to a tag link.
         */
        replaceTags: function(text) {
            return text.replace(this.regex, function(tag) {
                tag = arguments[2];
                return ' <a class="label label-default" href="#/notes/f/tag/q/' +
                    tag + '">' + Tags.symbol + tag + '</a>';
            });
        },

        /**
         * Parse text for tags.
         */
        getTags: function(text) {
            var result = text.match(this.regex),
                tags   = [];

            _.each(result, function(tag) {
                tags.push(tag.trim().replace(Tags.symbol, ''));
            });

            return _.uniq(tags);
        },

        /**
         * Add hooks to Pagedown editor
         */
        addHook: function(converter) {
            converter.hooks.chain('preConversion', function(text) {
                return Tags.replaceTags(text);
            });
        }
    };

    Radio.request('init', 'add', 'module', function() {
        // Setup regex
        Tags.configure();

        // Parses text for tags
        Radio.reply('editor', 'get:tags', Tags.getTags, Tags);

        // When editor converter is initialized, add hooks
        Radio.on('editor', 'converter:init', Tags.addHook, Tags);
    });

    return Tags;

});
