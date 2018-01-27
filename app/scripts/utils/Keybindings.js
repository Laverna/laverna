/**
 * @module utils/Keybindings
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/pause/mousetrap-pause';

/**
 * Keybindings helper.
 *
 * @class
 * @license MPL-2.0
 */
export default class Keybindings {

    /**
     * Radio channel.
     *
     * @returns {Object} utils/Keybindings
     */
    get channel() {
        return Radio.channel('utils/Keybindings');
    }

    /**
     * Links used with jump keybindings.
     *
     * @returns {Object}
     */
    get jumpLinks() {
        return {
            jumpInbox     : '/notes',
            jumpFavorite  : '/notes/f/favorite',
            jumpRemoved   : '/notes/f/trashed',
            jumpOpenTasks : '/notes/f/task',
            jumpNotebook  : '/notebooks',
        };
    }

    constructor() {
        this.channel.reply({
            toggle: this.toggle,
        }, this);
    }

    /**
     * Pause or unpause Mousetrap.
     */
    toggle() {
        Mousetrap[(this.paused ? 'unpause' : 'pause')]();
        this.paused = !this.paused;
    }

    /**
     * Bind shortcuts.
     *
     * @returns {Promise}
     */
    bind() {
        return Radio.request('collections/Configs', 'find')
        .then(collection => this.collection = collection)
        .then(() => this.bindApp())
        .then(() => this.bindJump());
    }

    /**
     * Bind application shortcuts.
     */
    bindApp() {
        const models = this.collection.appShortcuts();

        _.each(models, model => {
            Mousetrap.bind(model.get('value'), () => {
                this.channel.trigger(model.get('name'));
                return false;
            });
        });
    }

    /**
     * Bind jump shortcuts.
     */
    bindJump() {
        _.each(this.jumpLinks, (link, name) => {
            const model = this.collection.get(name);
            Mousetrap.bind(model.get('value'), () => this.navigate(link));
        });
    }

    /**
     * Navigate to a page.
     *
     * @param {String} url
     */
    navigate(url) {
        Radio.request('utils/Url', 'navigate', {url});
    }

}

/**
 * Initializer.
 *
 * @returns {Promise}
 */
Radio.once('App', 'start', () => {
    return new Keybindings().bind();
});
