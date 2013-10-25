/*global define*/
/*global Markdown*/
define([
    'underscore',
    'jquery',
    'ace',
    'pagedown-ace'
], function (_, $, ace) {
    'use strict';

    var View = {

        pagedownRender: function () {
            var converter, editor;

            converter = new Markdown.Converter();
            editor = new Markdown.Editor(converter);

            // ACE
            var wmd = ace.edit('wmd-input');

            wmd.renderer.setShowGutter(false);
            wmd.renderer.setPrintMarginColumn(false);
            wmd.session.setUseWrapMode(true);
            wmd.session.setNewLineMode('unix');

            editor.run(wmd);

            // Hide default buttons
            this.$('.wmd-button-row li').addClass('btn').css('left', 0).find('span').hide();
            this.$('.wmd-button-row').addClass('btn-group');

            // Font-awesome buttons
            this.$('#wmd-italic-button').append($('<i class="fa fa-italic">'));
            this.$('#wmd-bold-button').append($('<i class="fa fa-bold">'));
            this.$('#wmd-link-button').append($('<i class="fa fa-globe">'));
            this.$('#wmd-quote-button').append($('<i class="fa fa-indent">'));
            this.$('#wmd-code-button').append($('<i class="fa fa-code">'));
            this.$('#wmd-image-button').append($('<i class="fa fa-picture-o">'));
            this.$('#wmd-olist-button').append($('<i class="fa fa-list-ol">'));
            this.$('#wmd-ulist-button').append($('<i class="fa fa-list">'));
            this.$('#wmd-heading-button').append($('<i class="fa fa-font">'));
            this.$('#wmd-hr-button').append($('<i class="fa fa-minus">'));
            this.$('#wmd-undo-button').append($('<i class="fa fa-reply">'));
            this.$('#wmd-redo-button').append($('<i class="fa fa-share">'));
        }
    };

    return View;
});
