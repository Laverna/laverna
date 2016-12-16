/**
 * @module components/codemirror/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';
import View from './View';

import codemirror from 'codemirror';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/edit/continuelist';
import 'codemirror/addon/mode/overlay';
import 'codemirror/keymap/vim';
import 'codemirror/keymap/emacs';
import 'codemirror/keymap/sublime';

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

    /**
     * Keybindings for Codemirror.
     *
     * @prop {Object}
     */
    get extraKeys() {
        return {
            'Cmd-B'  : this.boldAction,
            'Ctrl-B' : this.boldAction,

            'Cmd-I'  : this.italicAction,
            'Ctrl-I' : this.italicAction,

            'Cmd-H'  : this.headingAction,
            'Ctrl-H' : this.headingAction,

            'Cmd-L'  : this.linkAction,
            'Ctrl-L' : this.linkAction,

            'Cmd-K'  : this.codeAction,
            'Ctrl-K' : this.codeAction,

            'Cmd-O'  : this.numberedListAction,
            'Ctrl-O' : this.numberedListAction,

            'Cmd-U'  : this.listAction,
            'Ctrl-U' : this.listAction,

            // Ctrl+d - divider
            'Cmd-G'  : this.attachmentAction,
            'Ctrl-G' : this.attachmentAction,

            // Ctrl+d - divider
            'Cmd-D'  : this.hrAction,
            'Ctrl-D' : this.hrAction,

            // Ctrl+. - indent line
            'Ctrl-.' 		: 'indentMore',
            'Shift-Ctrl-.' 	: 'indentLess',
            'Cmd-.' 		: 'indentMore',
            'Shift-Cmd-.'	: 'indentLess',

            Enter : 'newlineAndIndentContinueMarkdownList',
        };
    }

    /**
     * Regular expressions for Markdown elements.
     *
     * @prop {Object}
     */
    get marks() {
        return {
            strong: {
                tag   : ['**', '__'],
                start : /(\*\*|__)(?![\s\S]*(\*\*|__))/,
                end   : /(\*\*|__)/,
            },
            em: {
                tag   : ['*', '_'],
                start : /(\*|_)(?![\s\S]*(\*|_))/,
                end   : /(\*|_)/,
            },
            strikethrough: {
                tag   : ['~~'],
                start : /(\*\*|~~)(?![\s\S]*(\*\*|~~))/,
                end   : /(\*\*|~~)/,
            },
            code: {
                tag    : '```\r\n',
                tagEnd : '\r\n```',
            },
            'unordered-list': {
                replace : /^(\s*)(\*|\-|\+)\s+/, // eslint-disable-line
                tag     : '* ',
            },
            'ordered-list': {
                replace : /^(\s*)\d+\.\s+/,
                tag     : '1. ',
            },
        };
    }

    initialize() {
        // Create debounced methods
        this.autoSave      = _.debounce(this.autoSave, 1000);
        this.onScroll      = _.debounce(this.onScroll, 10);

        _.bindAll(
            this,
            'onChange',
            'onScroll',
            'onCursorActivity',
            'boldAction',
            'italicAction',
            'headingAction',
            'linkAction',
            'codeAction',
            'numberedListAction',
            'listAction',
            'attachmentAction',
            'hrAction'
        );
    }

    onDestroy() {
        log('destroyed');
        this.channel.stopReplying();
        this.editor.toTextArea();
    }

    /**
     * Initialize the editor.
     */
    init() {
        this
        .show()
        .initEditor()
        .listenToEvents()
        .updatePreview();
    }

    /**
     * Render the view.
     */
    show() {
        this.view = new View({
            model   : this.formChannel.request('getModel'),
            configs : this.configs,
        });

        this.formChannel.request('showChildView', 'editor', this.view);
        return this;
    }

    /**
     * Initialize Codemirror editor.
     */
    initEditor() {
        this.editor = codemirror.fromTextArea(document.getElementById('editor--input'), {
            mode          : {
                name        : 'gfm',
                gitHubSpice : false,
            },
            keyMap        : this.configs.textEditor || 'default',
            lineNumbers   : false,
            matchBrackets : true,
            lineWrapping  : true,
            indentUnit    : parseInt(this.configs.indentUnit, 10),
            extraKeys     : this.extraKeys,
        });

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

        // Listen to form view events
        this.listenTo(this.formChannel, 'change:mode', this.onChangeMode);
        this.listenTo(this.channel, 'focus', () => this.editor.focus());

        // Listen to Codemirror events
        window.dispatchEvent(new Event('resize'));
        this.editor.on('change', this.onChange);
        this.editor.on('scroll', this.onScroll);
        this.editor.on('cursorActivity', this.onCursorActivity);

        // Start replying to requests
        this.channel.reply({
            getData   : this.getData,
            makeLink  : this.makeLink,
            makeImage : this.makeImage,
        }, this);

        return this;
    }

    /**
     * Update the preview.
     *
     * @returns {Promise}
     */
    updatePreview() {
        const {attributes} = this.view.model;
        const data = _.extend({}, attributes, {
            content: this.editor.getValue(),
        });

        return Radio.request('components/markdown', 'render', data)
        .then(content => this.view.trigger('change:editor', {content}));
    }

    /**
     * If a WYSIWYG buttons is clicked, call a switable method.
     * For instance, if action of the button is equal to bold,
     * call "boldAction" method.
     *
     * @param {Object} data = {}
     * @param {String} data.action
     */
    onClickButton(data = {}) {
        if (this[`${data.action}Action`]) {
            this[`${data.action}Action`]();
        }
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
        this.updatePreview();
        this.autoSave();
    }

    /**
     * Trigger save:auto event.
     */
    autoSave() {
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
        const info       = this.editor.getScrollInfo();
        const lineNumber = this.editor.lineAtHeight(info.top, 'local');
        const range      = this.editor.getRange(
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
        const state = this.getState();
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
            currentLine   : this.getCursor().start.line + 1,
            numberOfLines : this.editor.lineCount(),
        });
    }

    /**
     * Return the starting and ending position of the currently active text.
     *
     * @returns {Object}
     */
    getCursor() {
        return {
            start : this.editor.getCursor('start'),
            end   : this.editor.getCursor('end'),
        };
    }

    /**
     * Return the state of the element under the cursor.
     *
     * @param {Number} pos=this.editor.getCursor'start'
     * @returns {Array}
     */
    getState(pos = this.editor.getCursor('start')) {
        const state = this.editor.getTokenAt(pos);

        if (!state.type) {
            return [];
        }

        state.type = state.type.split(' ');

        if (_.indexOf(state.type, 'variable-2') !== -1) {
            if (/^\s*\d+\.\s/.test(this.editor.getLine(pos.line))) {
                state.type.push('ordered-list');
            }
            else {
                state.type.push('unordered-list');
            }
        }

        return state.type;
    }

    /**
     * Return data from the editor including content, tags, tasks, files, etc...
     *
     * @returns {Object}
     */
    getData() {
        const content = this.editor.getValue();
        const keys    = ['tags', 'tasks', 'taskCompleted', 'taskAll', 'files'];

        return Radio.request('components/markdown', 'parse', {content})
        .then(env => {
            return _.extend(_.pick(env, keys), {content});
        });
    }

    /**
     * Make the selected text strong.
     */
    boldAction() {
        this.toggleBlock('strong');
    }

    /**
     * Make the selected text italicized.
     */
    italicAction() {
        this.toggleBlock('em');
    }

    /**
     * Toggle a Markdown block.
     *
     * @param {String} type - strong, em, etc...
     */
    toggleBlock(type) {
        const stat  = this.getState();
        let cursor;

        // The text is already [strong|italic|etc]
        if (_.indexOf(stat, type) !== -1) {
            cursor = this.removeMarkdownTag(type);
        }
        else {
            cursor = this.addMarkdownTag(type);
        }

        this.editor.setSelection(cursor.start, cursor.end);
        this.editor.focus();
    }

    /**
     * Wrap selected text with a Markdown tag.
     *
     * @param {String} type - strong, em, etc...
     * @returns {Object} cursor positions
     */
    addMarkdownTag(type) {
        const {start, end} = this.getCursor();
        let text = this.editor.getSelection();

        for (let i = 0; i < this.marks[type].tag.length - 1; i++) {
            text = text.split(this.marks[type].tag[i]).join('');
        }

        this.editor.replaceSelection(
            this.marks[type].tag[0] + text + this.marks[type].tag[0]
        );
        start.ch += this.marks[type].tag[0].length;
        end.ch    = start.ch + text.length;
        return {start, end};
    }

    /**
     * Remove markdown tags from the text under cursor.
     *
     * @param {String} type - strong, em, etc...
     * @returns {Object} cursor positions
     */
    removeMarkdownTag(type) {
        const {start, end} = this.getCursor();
        const text    = this.editor.getLine(start.line);
        let startText = text.slice(0, start.ch);
        let endText   = text.slice(start.ch);

        // Remove Markdown tags from the text
        startText = startText.replace(this.marks[type].start, '');
        endText   = endText.replace(this.marks[type].end, '');

        this.replaceRange(startText + endText, start.line);
        start.ch -= this.marks[type].tag[0].length;
        end.ch   -= this.marks[type].tag[0].length;
        return {start, end};
    }

    /**
     * Create headings.
     */
    headingAction() {
        const {start, end} = this.getCursor();

        for (let i = start.line; i <= end.line; i++) {
            this.toggleHeading(i);
        }
    }

    /**
     * Convert text on a line to a headline.
     *
     * @param {Number} i - line number
     */
    toggleHeading(i) {
        let text         = this.editor.getLine(i);
        const headingLvl = text.search(/[^#]/);

        // Create a default headline text if there is no text on the line
        if (headingLvl === -1) {
            text = '# Heading';
            this.replaceRange(text, i);
            return this.editor.setSelection({line: i, ch: 2}, {line: i, ch: 9});
        }

        // Increase headline level up to 6th
        if (headingLvl < 6) {
            text = headingLvl > 0 ? text.substr(headingLvl + 1) : text;
            text = `${new Array(headingLvl + 2).join('#')} ${text}`;
        }
        else {
            text = text.substr(headingLvl + 1);
        }

        this.replaceRange(text, i);
    }

    /**
     * Replace text on a line.
     *
     * @param {String} text
     * @param {Number} line
     */
    replaceRange(text, line) {
        this.editor.replaceRange(text, {line, ch: 0}, {line, ch: 99999999999999});
        this.editor.focus();
    }

    /**
     * Show a dialog to attach images or files.
     */
    attachmentAction() {
        const dialog = Radio.request('components/fileDialog', 'show', {
            model: this.view.model,
        });

        if (!dialog) {
            return;
        }

        return dialog.then(text => {
            if (text && text.length) {
                this.editor.replaceSelection(text, true);
                this.editor.focus();
            }
        });
    }

    /**
     * Show a link dialog.
     */
    linkAction() {
        const dialog = Radio.request('components/linkDialog', 'show');

        if (!dialog) {
            return;
        }

        return dialog.then(link => {
            if (!link || !link.length) {
                return;
            }

            const cursor = this.editor.getCursor('start');
            const text   = this.editor.getSelection() || 'Link';

            this.editor.replaceSelection(`[${text}](${link})`);
            this.editor.setSelection(
                {line: cursor.line, ch: cursor.ch + 1},
                {line: cursor.line, ch: cursor.ch + text.length + 1}
            );
            this.editor.focus();
        });
    }

    /**
     * Create a divider.
     */
    hrAction() {
        const start = this.editor.getCursor('start');
        this.editor.replaceSelection('\r\r-----\r\r');

        start.line += 4;
        start.ch    = 0;
        this.editor.setSelection(start, start);
        this.editor.focus();
    }

    /**
     * Create a code block.
     */
    codeAction() {
        const state = this.getState();
        const {start, end} = this.getCursor();

        // Do nothing if the text under cursor is already a code block
        if (_.indexOf(state, 'code') !== -1) {
            return;
        }

        const text = this.editor.getSelection();
        this.editor.replaceSelection(
            this.marks.code.tag + text + this.marks.code.tagEnd
        );

        this.editor.setSelection(
            {line : start.line + 1, ch : start.ch},
            {line : end.line + 1,   ch : end.ch}
        );
        this.editor.focus();
    }

    /**
     * Convert selected text to unordered list.
     */
    listAction() {
        this.toggleLists('unordered-list');
    }

    /**
     * Convert selected text to ordered list.
     */
    numberedListAction() {
        this.toggleLists('ordered-list', 1);
    }

    /**
     * Convert several selected lines to ordered or unordered lists.
     *
     * @param {String} type - unordered-list|ordered-list
     * @param {Number} order
     */
    toggleLists(type, order) {
        const {start, end} = this.getCursor();
        const state = this.getState();

        _.each(new Array(end.line - start.line + 1), (val, i) => {
            const line = start.line + i;
            this.toggleList({type, line, state, order});

            if (order) {
                order++; // eslint-disable-line
            }
        });
    }

    /**
     * Convert text on a line to an ordered or unordered list.
     *
     * @param {Object} data
     */
    toggleList(data) {
        let text = this.editor.getLine(data.line);

        // If it is a list, convert it to normal text
        if (_.indexOf(data.state, data.type) !== -1) {
            text = text.replace(this.marks[data.type].replace, '$1');
        }
        else if (data.order) {
            text = `${data.order}. ${text}`;
        }
        else {
            text = this.marks[data.type].tag + text;
        }

        this.replaceRange(text, data.line);
    }

    /**
     * Redo the last action in Codemirror.
     */
    redoAction() {
        this.editor.redo();
    }

    /**
     * Undo the last action in Codemirror.
     */
    undoAction() {
        this.editor.undo();
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
