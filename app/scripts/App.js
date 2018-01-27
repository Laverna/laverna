/**
 * @module App
 */
import {Application} from 'backbone.marionette';
import {history} from 'backbone';
import Radio from 'backbone.radio';
import $ from 'jquery';
import deb from 'debug';

import Initializer from './utils/Initializer';
import LayoutView from './views/Layout';

const log = deb('lav:App');

/**
 * The main app (core).
 *
 * @class
 * @extends Application
 * @license MPL-2.0
 */
export default class App extends Application {

    get channelName() {
        return 'App';
    }

    get channel() {
        return this.getChannel();
    }

    /**
     * The main layout view.
     *
     * @see module:views/Layout
     * @returns {Object}
     */
    get layout() {
        return new LayoutView();
    }

    /**
     * It's called after instantiating the class.
     *
     * @fires App#init
     */
    initialize() {
        log('initialized');

        // Start listening to initialize events
        new Initializer();

        /**
         * App was initialized but hasn't started yet.
         *
         * @event App#init
         */
        this.channel.trigger('init');

        // Render the layout
        this.layout.render();
    }

    /**
     * Start routers and notify other components that the app has started.
     *
     * @fires App#start
     */
    onStart() {
        log('starting the core...');
        history.start({pushStart: false});

        /**
         * App has started.
         *
         * @event App#start
         */
        this.channel.trigger('start');

        // Remove loading class
        $('.-loading').removeClass('-loading');
    }

    /**
     * Lazy start the app.
     * Wait until other components complete their tasks, then start the app.
     * This method is used for fetching settings and doing other things
     * before starting the app.
     *
     * @listens utils/Initializer#App:core - initialize core components
     * @listens utils/Initializer#App:utils - initialize utils
     * @listens utils/Initializer#App:components - init other components
     * @listens utils/Initializer#App:auth - authentication
     * @listens utils/Initializer#App:checks - init some checks before starting the app
     * @returns {Promise}
     * @todo handle errors
     */
    lazyStart() {
        return Radio.request('utils/Initializer', 'start', {
            names: ['App:core', 'App:utils', 'App:components', 'App:auth', 'App:last'],
        })
        .then(() => this.start())
        .catch(err => log('error', err));
    }

}
