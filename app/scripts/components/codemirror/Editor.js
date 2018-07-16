/**
 * @module components/codemirror/Editor
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import codemirror from 'codemirror';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/edit/continuelist';
import 'codemirror/addon/mode/overlay';
import 'codemirror/keymap/vim';
import 'codemirror/keymap/emacs';
import 'codemirror/keymap/sublime';

/**
 * Codemirror class.
 * Configure Codemirror and add extra keybindings.
 *
 * @class
 * @license MPL-2.0
 */
export default class Codemirror {

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
            checkbox: {
                tag    : '[ ] ',
                tagEnd : '\r\n',
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

    constructor(options) {
        this.options = options;

        _.bindAll(
            this,
            'boldAction',
            'italicAction',
            'headingAction',
            'linkAction',
            'codeAction',
            'checkboxAction',
            'numberedListAction',
            'listAction',
            'attachmentAction',
            'hrAction'
        );
    }

    /**
     * Initialize Codemirror editor.
     */
    init() {
        const $input = document.getElementById('editor--input');

        /**
         * Codemirror instance.
         *
         * @prop {Object}
         */
        this.instance = codemirror.fromTextArea($input, {
            mode            : {
                name        : 'gfm',
                gitHubSpice : false,
            },
            keyMap          : this.options.configs.textEditor || 'default',
            lineNumbers     : false,
            matchBrackets   : true,
            lineWrapping    : true,
            indentUnit      : parseInt(this.options.configs.indentUnit, 10),
            extraKeys       : this.extraKeys,
            inputStyle      : 'contenteditable',
            spellcheck      : true,
        });
    }

    /**
     * Return the starting and ending position of the currently active text.
     *
     * @returns {Object}
     */
    getCursor() {
        return {
            start : this.instance.getCursor('start'),
            end   : this.instance.getCursor('end'),
        };
    }

    /**
     * Return the state of the element under the cursor.
     *
     * @param {Number} pos=this.instance.getCursor'start'
     * @returns {Array}
     */
    getState(pos = this.instance.getCursor('start')) {
        const state = this.instance.getTokenAt(pos);

        if (!state.type) {
            return [];
        }

        state.type = state.type.split(' ');

        if (_.indexOf(state.type, 'variable-2') !== -1) {
            if (/^\s*\d+\.\s/.test(this.instance.getLine(pos.line))) {
                state.type.push('ordered-list');
            }
            else {
                state.type.push('unordered-list');
            }
        }

        return state.type;
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

        this.instance.setSelection(cursor.start, cursor.end);
        this.instance.focus();
    }

    /**
     * Wrap selected text with a Markdown tag.
     *
     * @param {String} type - strong, em, etc...
     * @returns {Object} cursor positions
     */
    addMarkdownTag(type) {
        const {start, end} = this.getCursor();
        let text = this.instance.getSelection();

        for (let i = 0; i < this.marks[type].tag.length - 1; i++) {
            text = text.split(this.marks[type].tag[i]).join('');
        }

        this.instance.replaceSelection(
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
        const text    = this.instance.getLine(start.line);
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
        let text         = this.instance.getLine(i);
        const headingLvl = text.search(/[^#]/);

        // Create a default headline text if there is no text on the line
        if (headingLvl === -1) {
            text = '# Heading';
            this.replaceRange(text, i);
            return this.instance.setSelection({line: i, ch: 2}, {line: i, ch: 9});
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
        this.instance.replaceRange(text, {line, ch: 0}, {line, ch: 99999999999999});
        this.instance.focus();
    }

    /**
     * Show a dialog to attach images or files.
     */
    attachmentAction() {
        const dialog = Radio.request('components/fileDialog', 'show', {
            model: this.options.model,
        });

        if (!dialog) {
            return;
        }

        return dialog.then(text => {
            if (text && text.length) {
                this.instance.replaceSelection(text, true);
                this.instance.focus();
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

            const cursor = this.instance.getCursor('start');
            const text   = this.instance.getSelection() || 'Link';

            this.instance.replaceSelection(`[${text}](${link})`);
            this.instance.setSelection(
                {line: cursor.line, ch: cursor.ch + 1},
                {line: cursor.line, ch: cursor.ch + text.length + 1}
            );
            this.instance.focus();
        });
    }

    /**
     * Create a divider.
     */
    hrAction() {
        const start = this.instance.getCursor('start');
        this.instance.replaceSelection('\r\r-----\r\r');

        start.line += 4;
        start.ch    = 0;
        this.instance.setSelection(start, start);
        this.instance.focus();
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

        const text = this.instance.getSelection();
        this.instance.replaceSelection(
            this.marks.code.tag + text + this.marks.code.tagEnd
        );

        this.instance.setSelection(
            {line : start.line + 1, ch : start.ch},
            {line : end.line + 1,   ch : end.ch}
        );
        this.instance.focus();
    }

    /**
     * Create a checkbox
     */
    checkboxAction() {
        // const state = this.getState();
        const {start, end} = this.getCursor();


        const text = this.instance.getSelection();
        this.instance.replaceSelection(
            this.marks.checkbox.tag + text + this.marks.checkbox.tagEnd
        );

        this.instance.setSelection(
            {line : start.line + 1, ch : start.ch},
            {line : end.line + 1,   ch : end.ch}
        );
        this.instance.focus();
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
        let text = this.instance.getLine(data.line);

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
        this.instance.redo();
    }

    /**
     * Undo the last action in Codemirror.
     */
    undoAction() {
        this.instance.undo();
    }

}
