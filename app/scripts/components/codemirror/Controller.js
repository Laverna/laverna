/**
 * @module components/codemirror/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';
import View from './View';

import Editor from './Editor';

const log = deb('lav:components/codemirror/Controller');

/**
 * Codemirror editor controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Radio channel.
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('components/editor');
    }

    /**
     * Note form view channel.
     *
     * @prop {Object}
     */
    get formChannel() {
        return Radio.channel('components/notes/form');
    }

    /**
     * App configs.
     *
     * @prop {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    initialize() {
        // Create debounced methods
        this.autoSave = _.debounce(this.autoSave, 1000);
        this.onScroll = _.debounce(this.onScroll, 10);

        _.bindAll(
            this,
            'onChange',
            'onScroll',
            'onCursorActivity'
        );
    }

    onDestroy() {
        log('destroyed');
        this.channel.stopReplying();
        this.editor.instance.toTextArea();
    }

    /**
     * Initialize the editor.
     */
    init() {
        // Render the view
        this.show();

        // Initialize Codemirror
        this.editor = new Editor(_.extend({configs: this.configs}, this.options));
        this.editor.init();

        // Start listening to events
        this.listenToEvents();
        this.updatePreview();
    }

    /**
     * Render the view.
     */
    show() {
        this.view = new View({
            model   : this.options.model,
            configs : this.configs,
        });

        this.formChannel.request('showChildView', 'editor', this.view);
        return this;
    }

    /**
     * Start listening to events.
     *
     * @listens this.channel#getData
     * @listens this.channel#focus
     * @listens this.channel#makeLink
     * @listens this.channel#makeImage
     */
    listenToEvents() {
        // Listen to view events
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'click:button', this.onClickButton);
        this.listenTo(this.view.model, 'synced', this.onModelSynced);

        // Listen to form view events
        this.listenTo(this.formChannel, 'change:mode', this.onChangeMode);
        this.listenTo(this.channel, 'focus', () => this.editor.instance.focus());

        // Listen to Codemirror events
        window.dispatchEvent(new Event('resize'));
        this.editor.instance.on('change', this.onChange);
        this.editor.instance.on('scroll', this.onScroll);
        this.editor.instance.on('cursorActivity', this.onCursorActivity);

        // Start replying to requests
        this.channel.reply({
            getContent: this.getContent,
            getData   : this.getData,
            makeLink  : this.makeLink,
            makeImage : this.makeImage,
        }, this);

        // Trigger "init" to inform that a model is being edited
        this.channel.trigger('init', {model: this.view.model});
        return this;
    }

    /**
     * Return the current content.
     *
     * @returns {String}
     */
    getContent() {
        return this.editor.instance.getValue();
    }

    /**
     * Update the preview.
     *
     * @returns {Promise}
     */
    updatePreview() {
        const {attributes} = this.view.model;
        const data = _.extend({}, attributes, {
            content: this.getContent(),
        });

        return Radio.request('components/markdown', 'render', data)
        .then(content => this.view.trigger('change:editor', {content}));
    }

    /**
     * If a WYSIWYG buttons is clicked, call a switable editor method.
     * For instance, if action of the button is equal to bold,
     * call "boldAction" method.
     *
     * @param {Object} data = {}
     * @param {String} data.action
     */
    onClickButton(data = {}) {
        if (this.editor[`${data.action}Action`]) {
            this.editor[`${data.action}Action`]();
        }
    }

    /**
     * Update Codemirror value. The method is called after synchronizing the model.
     */
    onModelSynced() {
        const cursor = this.editor.instance.getCursor();

        // Update the content
        const content = _.cleanXSS(this.view.model.get('content'), true);
        this.editor.instance.setValue(content);

        // Update cursor position
        this.editor.instance.setCursor(cursor);
    }

    /**
     * Editor mode is changed.
     *
     * @param {Object} data
     * @param {String} data.mode - fullscreen, preview, normal
     */
    onChangeMode(data) {
        window.dispatchEvent(new Event('resize'));
        this.view.trigger('change:mode', data);
    }

    /**
     * Text in the editor changed.
     */
    onChange() {
        log('change');
        this.view.model.trigger('update:stats', {content: this.getContent()});

        this.updatePreview();
        this.autoSave();
    }

    /**
     * Trigger save:auto event.
     */
    autoSave() {
        // Set content only if a user isn't using P2P sync
        if (this.configs.cloudStorage !== 'p2p') {
            this.view.model.set('content', this.getContent());
        }

        this.formChannel.trigger('save:auto');
    }

    /**
     * Synchronize the editor's scroll position with the preview's.
     *
     * @param {Object} e
     */
    onScroll(e) {
        // Don't do anything
        if (!e.doc.scrollTop) {
            this.view.ui.previewScroll.scrollTop(0);
            return;
        }

        // Get the visible range of the text in the editor
        const info       = this.editor.instance.getScrollInfo();
        const lineNumber = this.editor.instance.lineAtHeight(info.top, 'local');
        const range      = this.editor.instance.getRange(
            {line: 0, ch: null},
            {line: lineNumber, ch: null}
        );

        // Convert the text to Markdown
        return Radio.request('components/markdown', 'render', {content: range})
        .then(html => this.syncPreviewScroll(e.doc, html));
    }

    /**
     * Synchronize the editor's scroll position with the preview's.
     *
     * @param {Object} doc
     * @param {String} html
     */
    syncPreviewScroll(doc, html) {
        const temp  = this.createSyncFragment(html);
        const lines = temp.children;

        const {preview, previewScroll} = this.view.ui;
        const els    = preview[0].children;
        const newPos = els[lines.length].offsetTop;

        /**
         * If the scroll position is on the same element,
         * change it according to the difference of scroll positions in the editor.
         */
        if (this.scrollTop && this.scrollPos === newPos) {
            this.view.ui.previewScroll.scrollTop(
                previewScroll.scrollTop() + (doc.scrollTop - this.scrollTop)
            );
            this.scrollTop = doc.scrollTop;
            return;
        }

        // Scroll to the last visible element's position
        previewScroll.animate({scrollTop: newPos}, 70, 'swing');

        this.scrollPos = newPos;
        this.scrollTop = doc.scrollTop;
    }

    /**
     * Create a temporary HTML fragment to calculate the scroll position
     * of the preview.
     *
     * @param {String} html
     * @returns {Object}
     */
    createSyncFragment(html) {
        const fragment = document.createDocumentFragment();
        const temp     = document.createElement('div');
        temp.innerHTML = html;
        fragment.appendChild(temp);
        return temp;
    }

    /**
     * Editor's cursor position changed.
     */
    onCursorActivity() {
        const state = this.editor.getState();
        this.$btns  = this.$btns || $('.editor--btns .btn');

        // Make a specific button active depending on the type of the element under cursor
        this.$btns.removeClass('btn-primary');
        for (let i = 0; i < state.length; i++) {
            const btn = `$btn${state[i]}`;
            this[btn] = this[btn] || $(`.editor--btns [data-state="${state[i]}"]`);
            this[`$btn${state[i]}`].addClass('btn-primary');
        }

        // Update lines in footer
        this.view.trigger('update:footer', {
            currentLine   : this.editor.getCursor().start.line + 1,
            numberOfLines : this.editor.instance.lineCount(),
        });
    }

    /**
     * Return data from the editor including content, tags, tasks, files, etc...
     *
     * @returns {Object}
     */
    getData() {
        const content = this.getContent();
        const keys    = ['tags', 'tasks', 'taskCompleted', 'taskAll', 'files'];

        return Radio.request('components/markdown', 'parse', {content})
        .then(env => {
            return _.extend(_.pick(env, keys), {content});
        });
    }

    /**
     * Make a markdown link.
     *
     * @param {Object} data
     * @param {String} data.text
     * @param {String} data.url
     * @returns {String}
     */
    makeLink(data) {
        return `[${data.text}](${data.url})`;
    }

    /**
     * Make a markdown image.
     *
     * @param {Object} data
     * @param {String} data.text - alt text
     * @param {String} data.url
     * @returns {String}
     */
    makeImage(data) {
        return `!${this.makeLink(data)}`;
    }

}
