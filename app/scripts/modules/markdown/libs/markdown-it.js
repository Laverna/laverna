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

            this.md.renderer.rules.hashtag_open  = function(tokens, idx, f, env) { // jshint ignore:line
                var tagName = tokens[idx].content.toLowerCase();

                if (env) {
                    env.tags = env.tags || [];
                    env.tags.push(tagName);
                }

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

        /**
         * Parse Markdown for tags, tasks, etc.
         */
        parse: function(content) {
            var env = {};

            return new Q(
                this.md.render(content, env)
            )
            .then(function() {
                env.tags = _.uniq(env.tags);
                return env;
            });
        },
    });

    return Markdown;
});
