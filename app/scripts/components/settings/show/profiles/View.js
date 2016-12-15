/**
 * @module components/settings/show/profiles/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';

/**
 * Profiles settings view.
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

    /**
     * Configs radio channel.
     *
     * @prop {Object}
     */
    get configsChannel() {
        return Radio.channel('collections/Configs');
    }

    ui() {
        return {
            profile: '#profileName',
        };
    }

    events() {
        return {
            'keypress @ui.profile' : 'createOnEnter',
            'click .removeProfile' : 'removeProfile',
        };
    }

    initialize() {
        this.listenTo(this.options.profiles, 'change', this.render);
    }

    /**
     * Create a ew profile if enter is pressed.
     *
     * @param {Object} e
     */
    createOnEnter(e) {
        // Create a new profile if enter is pressed
        if (e.which === 13) {
            e.preventDefault();
            return this.createProfile();
        }
    }

    /**
     * Create a new profile.
     *
     * @returns {Promise}
     */
    createProfile() {
        const name = this.ui.profile.val().trim();

        if (name.length) {
            return this.configsChannel.request('createProfile', {name})
            .then(() => {
                const {profiles} = this.options;
                profiles.attributes.value.push(name);
                profiles.set('value', _.unique(profiles.attributes.value));
            });
        }
    }

    /**
     * Remove a profile.
     *
     * @returns {Promise}
     */
    removeProfile(e) {
        e.preventDefault();
        const name = this.$(e.currentTarget).attr('data-profile');

        if (name.length) {
            return Radio.request('components/confirm', 'show', {
                content: _.i18n('profile.confirm remove', {profile: name}),
            })
            .then(res => {
                if (res !== 'confirm') {
                    return;
                }
                return this.configsChannel.request('removeProfile', {name});
            });
        }
    }

    serializeData() {
        return {
            appProfiles: this.options.profiles.get('value'),
        };
    }

}
