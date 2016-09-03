/* global define */
define([
    'underscore',
    'q',
    'markdown-it',
    'prism/bundle',
    'markdown-it-san',
    'markdown-it-hash',
    'markdown-it-math',
    'markdown-it-imsize',
    'modules/markdown/libs/markdown-it-task',
    'modules/markdown/libs/markdown-it-file',
], function(_, Q, MarkdownIt, Prism, sanitizer, hash, math, imsize, task, file) {
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
        objectURLs: {},

        /**
         * Configure MarkdownIt.
         */
        configure: function() {
            this.md
            .use(sanitizer)
            .use(imsize)
            .use(math, {
                inlineOpen       : '$',
                inlineClose      : '$',
                blockOpen        : '$$',
                blockClose       : '$$',
                renderingOptions : {},
                inlineRenderer   : function(tokens) {
                    return '<span class="math inline">$' + tokens + '$</span>';
                },
                blockRenderer    : function(tokens) {
                    return '<div class="math block">$$' + tokens + '$$</div>';
                },
            })
            .use(hash, {
				hashtagRegExp: '[\\u0021-\\uFFFF\\w\\-]+|<3',
				preceding: '^|\\s'
				})
            .use(task.init)
            .use(file.init)
            ;

            // Make table responsive
            this.md.renderer.rules.table_open  = function() { // jshint ignore:line
                return '<div class="table-responsive"><table>';
            };
            this.md.renderer.rules.table_close  = function() { // jshint ignore:line
                return '</table></div>';
            };

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
        render: function(model) {
            var env  = {
                modelData : model,
                objectURLs: this.objectURLs
            };

            if (model.id) {
                file.revokeURLs(this.objectURLs, model);
            }

            return new Q(
                this.md.render(_.unescape(model.content), env)
            );
        },

        /**
         * Toggle a task's status.
         */
        taskToggle: function(data) {
            data.content = _.unescape(data.content);
            data.content = task.toggle(data);

            return this.parse(data.content)
            .then(function(env) {
                return _.extend({content: data.content}, env);
            });
        },

        /**
         * Parse Markdown for tags, tasks, etc.
         */
        parse: function(content) {
            var env = {};

            return new Q(
                this.md.render(_.unescape(content), env)
            )
            .then(function() {
                env.tags    = env.tags ? _.uniq(env.tags) : [];
                env.files   = env.files ? _.uniq(env.files) : [];
                env.taskAll = env.tasks ? env.tasks.length : 0;
                return env;
            });
        },
    });

    return Markdown;
});
