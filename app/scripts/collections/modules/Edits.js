/**
 * @module collections/modules/Edits
 */
import Module from './Module';
import Collection from '../Edits';
import _ from 'underscore';
import deb from 'debug';

const log = deb('lav:collections/modules/Edits');

/**
 * Edits collection module.
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Edits extends Module {

    /**
     * Shadow collection.
     *
     * @see module:collections/Edits
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    constructor() {
        super();

        this.channel.reply({
            clearDiffs: this.clearDiffs,
        }, this);
    }

    /**
     * Clear a model's diffs.
     *
     * @param {Object} model
     * @param {Object} shadow
     * @param {Boolean} clearAll - true if all diffs should be cleared
     * @returns {Promise}
     */
    clearDiffs({model, shadow, clearAll}) {
        let diffs = [];

        if (!clearAll) {
            diffs = _.filter(model.get('diffs'), diff => {
                return diff.m >= shadow.get('m');
            });
        }

        log('clearing diffs', diffs);
        model.set({diffs, p: shadow.get('p')});
        return this.saveModel({model});
    }

}
