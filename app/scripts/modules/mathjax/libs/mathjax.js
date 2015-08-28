/* global define */
define([
    'underscore',
    'mathjax'
], function(_, MathJax) {
    'use strict';

    var MathHelper = {

        /**
         * Render MathJax.
         */
        render: function(view) {
            this.view = view || this.view;

            // MathJax shouldn't be rendered inside of Pagedown editor.
            var el = (
                this.view.ui && this.view.ui.preview ?
                      this.view.ui.preview[0] :
                      this.view.el
                );

            MathJax.Hub.Queue(['Typeset', MathJax.Hub, el]);
        },

        /**
         * Add hooks after converter is initialized.
         *
         * Replace special characters inside MathJax expressions
         * with HTML escape codes.
         *
         * Characters which will be replaced:
         * 1. ``_``   - underscores.
         * 2. ``[x]`` - to avoid rendering it as a task.
         * 3. ``\\``  - to three backslashes.
         * 4. `` ``   - spaces to avoid rendering MathJax expression as a code block.
         * 5. ``@``   - because of tags.
         */
        onInitConverter: function(converter) {
            var regex = /\$+\s+([^\$])+\s+\$+/gm;

            converter.hooks.chain('preConversion', function(text) {
                text = text.replace(regex, function(str) {
                    str = str
                    .replace(/_+/g, '&#95;')
                    .replace(/\[(x)?\]/gi, '&#91;$1&#93;')
                    .replace(/\\\\/g, '\\\\\\')
                    .replace(/ /g, '&nbsp;')
                    .replace(/\@/g, '&#64;');

                    return str;
                });

                return text;
            });
        }

    };

    return MathHelper;
});
