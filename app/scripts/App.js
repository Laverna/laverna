import {Application} from 'backbone.marionette';
import {history} from 'backbone';
import Radio from 'backbone.radio';
import deb from 'debug';

const log = deb('lav:App');

/**
 * The main app (core).
 *
 * @class App
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
     * It's called after instantiating the class.
     *
     * @fires App#init
     */
    initialize() {
        log('initialized', this.channel);

        /**
         * App was initialized but hasn't started yet.
         *
         * @event App#init
         */
        this.channel.trigger('init');
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
        this.channel.trigger('start');
    }

    /**
     * Lazy start the app.
     * Wait until other components complete their tasks, then start the app.
     *
     * @returns {Promise}
     * @todo wait for initializers
     */
    lazyStart() {
        return Radio.request('utils/Initializer', 'start', {
            names: ['App:before'],
        })
        .then(() => this.start())
        .catch(err => log('error', err));
    }

}
