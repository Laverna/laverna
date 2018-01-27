/**
 * @module components/share/Controller
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import Mn from 'backbone.marionette';
import View from './View';
import deb from 'debug';

const log = deb('lav:components/share/Controller');

/**
 * Share controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Component channel (components/share)
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('components/share');
    }

    /**
     * Signal model channel (models/Signal)
     *
     * @prop {Object}
     */
    get signalChannel() {
        return Radio.channel('models/Signal');
    }

    initialize() {
        this.channel.reply({
            show: this.init,
        }, this);
    }

    /**
     * @public
     * @todo use profileId when fetching users?
     * @param {Object} data
     * @param {Object} data.model
     */
    init(data) {
        this.username = Radio.request('collections/Profiles', 'getProfile');

        return Radio.request('collections/Users', 'find')
        .then(users => this.show(data, users))
        .catch(err => log('error', err));
    }

    /**
     * Render the view.
     *
     * @protected
     * @param {Object} model
     */
    show({model}, users) {
        this.view = new View({model, users});
        Radio.request('Layout', 'show', {region: 'modal', view: this.view});

        this.listenTo(this.view, 'search:user', this.searchUser);
        this.listenTo(this.view, 'childview:add:trust', this.addTrust);
        this.listenTo(this.view, 'childview:share', this.shareWith);
    }

    /**
     * Check if a user exists on the signaling server.
     *
     * @protected
     * @returns {Promise}
     */
    searchUser() {
        const username = this.view.ui.search.val().trim();

        if (!username.length || username === this.username ||
            this.view.options.users.findWhere({username})) {
            return;
        }

        // Disable the search form
        this.view.triggerMethod('search', {disabled: true});

        // Try to find on the signaling server
        return this.signalChannel.request('findUser', {username})
        .then(user => {
            this.view.triggerMethod('search', {disabled: false});

            // Show a warning that a user does not exist
            if (_.isEmpty(user) || user.username !== username) {
                return this.view.triggerMethod('user:error');
            }

            this.view.showUserInfo({user});
        })
        .catch(err => log('error', err));
    }

    /**
     * Add a user to trust.
     *
     * @protected
     * @param {Object} view
     * @returns {Promise}
     */
    addTrust(view) {
        return Radio.request('collections/Users', 'invite', {
            user: view.options.user,
        })
        .then(()   => this.view.showUsers())
        .catch(err => log('error', err));
    }

    /**
     * Start sharing with a user.
     *
     * @protected
     * @param {String} username
     * @returns {Promise}
     */
    shareWith({username}) {
        this.view.model.toggleShare(username);

        return this.view.model.channel.request('saveModel', {
            model: this.view.model,
        });
    }

}

Radio.once('App', 'init', () => new Controller());
