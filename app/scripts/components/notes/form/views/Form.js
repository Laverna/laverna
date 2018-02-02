/**
 * @module components/notes/form/views/Form
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import $ from 'jquery';
import deb from 'debug';

import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

import Content from '../../../../behaviors/Content';
import Notebooks from './Notebooks';

const log = deb('lav:components/notes/form/views/Form');

/**
 * Note form view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Form extends Mn.View {

    get template() {
        const tmpl = require('../templates/form.html');
        return _.template(tmpl);
    }

    get className() {
        return 'layout--body';
    }

    /**
     * Behaviors.
     *
     * @see module:behaviors/Content
     * @returns {Array}
     */
    get behaviors() {
        return [Content];
    }

    /**
     * Radio channel.
     * components/notes/form
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel('components/notes/form');
    }

    /**
     * Regions (editor, notebooks.)
     *
     * @returns {Object}
     */
    regions() {
        return {
            editor    : '#editor',
            notebooks : '#editor--notebooks',
        };
    }

    ui() {
        return {
            form       : '.editor--form',
            saveBtn    : '.editor--save',
            title      : '#editor--input--title',
            words      : '#editor--footer--words',
            chars      : '#editor--footer--chars',
        };
    }

    events() {
        return {
            'click .editor--mode a' : 'switchMode',
            'submit @ui.form'       : 'save',
            'click @ui.saveBtn'     : 'save',
            'click .editor--cancel' : 'cancel',
            'change @ui.title'      : 'setTitle',
        };
    }

    modelEvents() {
        return {
            'change:title': 'onChangeTitle',
            'update:stats': 'showStats',
        };
    }

    /**
     * Initialize.
     *
     * @listens this.channel#getModel returns the model (request)
     * @listens this.channel#showChildView shows a view in a region (request)
     * @listens this.channel#save:auto calls autoSave method
     */
    initialize() {
        this.$body = $('body');

        // Reply to requests
        this.channel.reply({
            getModel      : this.model,
            showChildView : this.showChildView,
        }, this);

        // Listen to events
        this.listenTo(this.channel, 'save:auto', this.autoSave);
        this.listenTo(this, 'bind:keys', this.bindKeys);

        // Unbind keyboard shortcuts if a modal window is shown
        this.listenTo(Radio.channel('views/Modal'), 'shown', this.unbindKeys);
        this.listenTo(Radio.channel('views/Modal'), 'hidden', this.bindKeys);

        this.bindKeys();
    }

    /**
     * Bind keyboard shortcuts.
     */
    bindKeys() {
        Mousetrap.bindGlobal(['ctrl+s', 'command+s'], e => this.save(e));
        Mousetrap.bindGlobal(['esc'], e => this.cancel(e));
    }

    /**
     * Unbind keyboard shortcuts.
     */
    unbindKeys() {
        Mousetrap.unbind(['ctrl+s', 'command+s', 'esc']);
    }

    /**
     * Show notebooks selector.
     */
    onRender() {
        const opt = _.extend({}, _.omit(this.options, 'model'), {
            collection: this.options.notebooks,
        });
        this.showChildView('notebooks', new Notebooks(opt));
    }

    /**
     * The view was rendered.
     *
     * @fires this.channel#ready
     */
    onAfterRender() {
        this.channel.trigger('ready', {model: this.model});

        // Focus on the title
        this.ui.title.trigger('focus');

        // Change edit mode
        if (this.options.configs.editMode !== 'normal') {
            this.switchMode(this.options.configs.editMode);
        }

        this.showStats();
    }

    /**
     * Show text stats, including a number of words, characters.
     *
     * @param {Object} data
     * @param {String} data.content
     */
    showStats(data = {}) {
        const text = data.content || this.model.get('content');
        this.ui.words.text(_.countWords(text));
        this.ui.chars.text(text.length);
    }

    /**
     * Trigger an event that the view is about to be destroyed.
     *
     * @fires this.channel#before:destroy
     */
    onBeforeDestroy() {
        this.normalMode();
        this.channel.trigger('before:destroy');
    }

    /**
     * Stop replying to requests and unbind Mousetrap keys.
     */
    onDestroy() {
        this.channel.stopReplying();
        this.unbindKeys();
    }

    /**
     * Save the note and redirect back.
     *
     * @fires this#save
     */
    save(e = {}) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        this.options.isClosed = true;
        this.trigger('save');
    }

    /**
     * Automatically save the changes.
     *
     * @fires this#save
     */
    autoSave() {
        // If the form is closed, don't do anything
        if (this.options.isClosed) {
            return;
        }

        log('auto save...');
        this.trigger('save', {autoSave: true});
    }

    /**
     * Cancel all changes.
     *
     * @fires this#cancel
     */
    cancel() {
        // Save which form element was under focus
        this.options.focus    = this.ui.title.is(':focus') ? 'title' : 'editor';
        this.options.isClosed = true;

        this.trigger('cancel');
        return false;
    }

    /**
     * Update "title" attribute after every change.
     */
    setTitle() {
        this.model.set('title', this.ui.title.val().trim());
    }

    /**
     * Update the title value after the attribute is changed.
     */
    onChangeTitle() {
        this.ui.title.val(_.cleanXSS(this.model.get('title')));
    }

    /**
     * Switch the editor mode.
     *
     * @param {(String|Object)} e
     */
    switchMode(e) {
        const mode = _.isString(e) ? e : this.$(e.currentTarget).attr('data-mode');

        if (!mode) {
            return;
        }

        // Close the dropdown menu
        this.ui.form.trigger('click');

        // Switch to another mode
        this[`${mode}Mode`]();

        // Trigger an event that the editor mode has changed
        this.channel.trigger('change:mode', {mode});

        // Save in configs
        Radio.request('collections/Configs', 'saveConfig', {
            config: {name: 'editMode', value: mode},
        });

        return false;
    }

    /**
     * Fullscreen mode.
     */
    fullscreenMode() {
        this.$body
        .removeClass('-preview')
        .addClass('editor--fullscreen');
    }

    /**
     * Preview mode (two panes)
     */
    previewMode() {
        this.$body.addClass('editor--fullscreen -preview');
    }

    /**
     * Normal mode (the sidebar with notes is shown on the left side)
     */
    normalMode() {
        this.$body.removeClass('editor--fullscreen -preview');
    }

}
