/**
 * @module components/codemirror/View
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import $ from 'jquery';

/**
 * Codemirror editor view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    get className() {
        return 'layout--body container-fluid';
    }

    ui() {
        return {
            preview       : '#wmd-preview',
            previewScroll : '.editor--preview',
            bar           : '.editor--bar',
        };
    }

    events() {
        return {
            'click .editor--btns .btn' : 'onClickButton',
            'click .editor--col--btn'  : 'showColumn',
        };
    }

    initialize() {
        this.options.mode = this.options.configs.editMode;
        this.$footer      = $('#editor--footer--lines');
        this.$layoutBody  = $('.layout--body.-scroll.-form');

        this.listenTo(this, 'change:mode', this.onChangeMode);
        this.listenTo(this, 'change:editor', this.onChangeEditor);
        this.listenTo(this, 'update:footer', this.updateFooter);
        this.$layoutBody.on('scroll', () => this.onScroll());
    }

    onDestroy() {
        this.$layoutBody.off('scroll');
    }

    /**
     * Trigger editor:action event.
     *
     * @param {Object} e
     */
    onClickButton(e) {
        e.preventDefault();
        const action = this.$(e.currentTarget).attr('data-action');

        if (action) {
            this.trigger('click:button', {action});
        }
    }

    /**
     * Shows either the preview or the editor.
     *
     * @param {Object} e
     */
    showColumn(e) {
        const $btn    = this.$(e.currentTarget);
        const col     = $btn.attr('data-col');
        const hideCol = (col === 'left' ? 'right' : 'left');

        // Add 'active' class to the button
        this.$('.editor--col--btn.active').removeClass('active');
        $btn.addClass('active');

        // Show only one column
        this.$(`.-${hideCol}`).removeClass('-show');
        this.$(`.-${col}`).addClass('-show');
    }

    /**
     * Editor mode has changed.
     *
     * @param {Object} data
     */
    onChangeMode(data) {
        this.options.mode = data.mode;

        if (data.mode !== 'normal') {
            // Make the editor visible by scrolling back
            this.$layoutBody.scrollTop(0);

            // Change WYSIWYG bar width
            this.ui.bar.css('width', 'initial');
            return this.ui.bar.removeClass('-fixed');
        }
    }

    /**
     * Text in the editor was changed.
     *
     * @param {Object} data
     */
    onChangeEditor(data) {
        this.ui.preview.html(data.content);

        if (!this.isFirst) {
            this.isFirst = true;
            return Radio.trigger('components/editor', 'render', this);
        }

        Radio.trigger('components/editor', 'preview:refresh', data);
    }

    /**
     * Update footer.
     *
     * @param {Object} data
     */
    updateFooter(data) {
        this.$footer.html(_.i18n('Line of', data));
    }

    /**
     * Scroll position of the document has changed.
     */
    onScroll() {
        // If editor mode is not 'normal' mode, don't do anything
        if (this.options.mode !== 'normal') {
            return;
        }

        // Fix WYSIWYG bar on top
        if (this.$layoutBody.scrollTop() > this.ui.bar.offset().top) {
            this.ui.bar.css('width', this.$layoutBody.width());
            return this.ui.bar.addClass('-fixed');
        }

        this.ui.bar.css('width', 'initial');
        return this.ui.bar.removeClass('-fixed');
    }

}
