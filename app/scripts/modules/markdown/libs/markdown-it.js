/* global define */
define([
    'underscore',
    'q',
    'markdown-it',
    'prism/bundle',
    'markdown-it-san',
    'markdown-it-hash',
], function(_, Q, MarkdownIt, Prism, sanitizer, hash) {
    'use strict';

    /**
     * Markdown parser helper.
     */
    function Markdown() {

        // Initialize MarkdownIt
        this.md = new MarkdownIt({
            html     : true,
            xhtmlOut : true,
            breaks   : true,
            linkify  : true,
            highlight: function(code, lang) {
                if (!Prism.languages[lang]) {
                    return '';
                }

                return Prism.highlight(code, Prism.languages[lang]);
            }
        });

        this.configure();
    }

    _.extend(Markdown.prototype, {

        /**
         * Configure MarkdownIt.
         */
        configure: function() {
            this.md
            .use(sanitizer)
            .use(hash)
            ;

            this.md.renderer.rules.hashtag_open  = function(tokens, idx) { // jshint ignore:line
                var tagName = tokens[idx].content.toLowerCase();
                return '<a href="#/notes/f/tag/q/' + tagName + '" class="label label-default">';
            };
        },

        /**
         * Convert Markdown to HTML.
         */
        render: function(content) {
            return new Q(
                this.md.render(content)
            );
        },

        parse: function(content) {
            return new Q(
                this.md.parse(content)
            );
        },
    });

    return Markdown;
});
