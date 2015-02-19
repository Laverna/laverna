/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!modules/pagedown/templates/editor.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Pagedown view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            wmdBar     : '#wmd-button-bar',
            preview    : '.wmd-preview',
            input      : '#wmd-input'
        },

        initialize: function() {
            Radio.on('notesForm', 'set:mode', this.onChangeMode, this);
            Radio.on('editor', 'pagedown:ready', this.onPagedownReady, this);
            Radio.on('editor', 'pagedown:scroll', this.syncScroll, this);
        },

        onDestroy: function() {
            Radio.off('editor', 'pagedown:scroll pagedown:ready');
            Radio.off('notesForm', 'set:mode');
        },

        onPagedownReady: function() {
            this.$scroll = $('.ace_scrollbar');
        },

        onChangeMode: function(mode) {
            if (mode === 'preview') {
                this.ui.input.css('height', 'auto');
            }
        },

        syncScroll: function() {
            var scrollTop = this._getScroll(this.$scroll, this.ui.preview);
            this.ui.preview.stop(true).animate({scrollTop: scrollTop}, 100, 'linear');
        },

        _getScroll: function($source, $el) {
            var scroll = this._getScrollVal($source),
                percent = scroll.scrollTop / (scroll.scrollHeight - scroll.offsetHeight);

            return percent * (
                $el.prop('scrollHeight') - $el.offset().top
            );
        },

        _getScrollVal: function($el) {
            return {
                scrollTop    : $el.scrollTop(),
                scrollHeight : $el.prop('scrollHeight'),
                offsetHeight : $el.offset().top
            };
        }
    });

    return View;
});
