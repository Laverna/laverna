import {Application} from 'backbone.marionette';
import {history} from 'backbone';
import deb from 'debug';
import Radio from 'backbone.radio';

const log = deb('lav:App');

/**
 * The main app (core).
 *
 * @class App
 * @extends Application
 * @license MPL-2.0
 */
export default class App extends Application {

    get radio() {
        return Radio.channel('App');
    }

    /**
     * It's called after instantiating the class.
     *
     * @fires App#init
     */
    initialize() {
        log('initialized');

        /**
         * App was initialized but hasn't started yet.
         *
         * @event App#init
         */
        this.radio.trigger('init');
    }

    /**
     * Start routers and notify other components that the app has started.
     *
     * @fires App#start
     */
    onStart() {
        history.start({pushStart: false});

        /**
         * App has started.
         *
         * @event App#start
         */
        this.radio.trigger('start');
    }

    /**
     * Lazy start the app.
     * Wait until other components complete their tasks, then start the app.
     *
     * @returns {Promise}
     * @todo wait for initializers
     */
    lazyStart() {
        return Promise.resolve(this.start());
    }

}
