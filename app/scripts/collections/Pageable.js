/**
 * @module collections/Pageable
 */
import Collection from './Collection';
import _ from 'underscore';

/**
 * Add pagination support to Backbone collections.
 *
 * @class
 * @extends module:collections/Collection
 * @license MPL-2.0
 */
export default class Pageable extends Collection {

    /**
     * Sort collection models by multiple fields.
     *
     * @returns {Object}
     */
    get comparators() {
        return this._comparators || {
            isFavorite : 'desc',
            created    : 'desc',
        };
    }

    /**
     * Comparator setter.
     *
     * @param {Object} options
     */
    set comparators(options) {
        this._comparators = options;
    }

    constructor(...args) {
        super(...args);

        /**
         * Pagination settings.
         *
         * @prop {Number} perPage - the number of items shown per a page
         * @prop {Number} first - the first page number (defaults to 0)
         * @prop {Number} current - the current page number
         * @prop {Number} total - total amount of pages in a collection
         * @returns {Object}
         */
        this.pagination = {
            perPage : 4,
            first   : 0,
            current : Number(this.options.page || 0),
            total   : 0,
        };

        // Use "perPage" config from the options
        if (!_.isUndefined(this.options.perPage)) {
            this.pagination.perPage = Number(this.options.perPage);
        }
    }

    /**
     * Paginate the collection.
     *
     * @returns {Object} this
     */
    paginate() {
        // Don't paginate
        if (!this.pagination.perPage) {
            return this;
        }

        if (!this.fullCollection) {
            this.fullCollection = this.clone();
        }

        // Sort the collection
        this.fullCollection.sortByComparators();

        // Paginate
        this.updateTotalPages();
        this.reset(this.getPage(this.pagination.current));

        return this;
    }

    /**
     * Start listening to events.
     *
     * @returns {Object} this
     */
    startListening() {
        // Sort the collection again if a comparator field has changed
        _.each(this.comparators, (sort, field) => {
            this.listenTo(this, `change:${field}`, this.sortByComparators, this);
        });

        // Sort again on reset event
        this.listenTo(this, 'reset', this.sortByComparators, this);

        // Listen to Radio channel events
        this.listenTo(this.channel, 'save:model', this.onUpdateModel, this);
        this.listenTo(this.channel, 'destroy:model', this.onDestroyModel, this);
        this.listenTo(this.channel, 'restore:model', this.onRestoreModel, this);

        return this;
    }

    /**
     * Stop listening to events and empty the full collection.
     *
     * @returns {Object} this
     */
    removeEvents() {
        if (this.fullCollection) {
            this.fullCollection.reset([]);
        }

        // Stop listening to events
        this.stopListening();

        return this;
    }

    /**
     * After a model was updated/added, re-sort the collection.
     *
     * @param {Object} data
     * @param {Object} data.model - Backbone model
     */
    onUpdateModel(data) {
        const {model} = data;

        // Don't add models from other profiles
        if (this.profileId !== model.profileId) {
            return;
        }

        /* Remove a model from the collection if it doesn't meet
         * the current filter condition.
         */
        if (!model.matches(this.currentCondition || {trash: 0})) {
            return this.onDestroyModel({model});
        }

        return this.updateCollectionModel({model});
    }

    /**
     * Update a model in the collection or add it if it doesn't exist.
     *
     * @param {Object} data
     * @param {Object} data.model - Backbone model.
     */
    updateCollectionModel(data) {
        const model = data.model;
        const collection      = this.fullCollection || this;
        const collectionModel = collection.get(model.id);

        // If the model already exists in the collection, just update its attributes
        if (collectionModel) {
            return collectionModel.set(model.attributes);
        }

        // Add the model to the beginning
        collection.add(model, {at: 0});

        // Re-sort and create pagination again
        this.paginate();
    }

    /**
     * Remove a model from the collection after it is destroyed.
     *
     * @param {Object} data
     * @param {Object} data.model - Backbone model.
     */
    onDestroyModel(data) {
        const collection = this.fullCollection || this;
        const model      = collection.get(data.model.id);

        // Do nothing if the model doesn't exist in the collection
        if (!model) {
            return false;
        }

        // Remove the model from the collection and re-sort
        collection.remove(model);
        this.paginate();

        // Navigate to the previous model
        this.navigateOnRemove(model);
    }

    /**
     * Navigate to the previous model.
     *
     * @param {Object} model - Backbone model
     * @fires Radio#model:navigate
     * @fires Radio#page:previous
     */
    navigateOnRemove(model) {
        let index = this.indexOf(model);

        // Model at the index doesn't exist
        if (!this.at(index)) {
            index--;
        }

        if (this.at(index)) {
            this.channel.trigger('model:navigate', {model: this.at(index)});
        }
        // Navigate to the previous page if a model at `index` doesn't exist
        else if (this.hasPreviousPage()) {
            this.channel.trigger('page:previous');
        }
    }

    /**
     * A model was restored from trash.
     *
     * @param {Object} data
     * @param {Object} data.model - Backbone model
     */
    onRestoreModel(data) {
        if (this.conditionFilter !== 'trashed') {
            this.onUpdateModel(data);
        }
        /* If the filter condition is equal to trashed,
         * remove the model from the collection.
         */
        else if (this.length > 1) {
            this.onDestroyModel(data);
        }
    }

    /**
     * Sort models by multiple fields.
     *
     * @returns {Array} sorted models
     */
    sortByComparators() {
        const comp = this.comparator;

        _.each(this.comparators, (sort, field) => {
            this.comparator = model => {
                return (sort === 'desc') ? -model.get(field) : model.get(field);
            };
            this.sort();
        });

        this.comparator = comp;
        return this.models;
    }

    /**
     * Update the number of available pages.
     *
     * @returns {Number} number of total pages
     */
    updateTotalPages() {
        return (this.pagination.total = Math.ceil(
            this.fullCollection.length / this.pagination.perPage
        ) - 1);
    }

    /**
     * Return true if there are models on the next page.
     *
     * @returns {Boolean}
     */
    hasNextPage() {
        return (!!this.pagination.total &&
            this.pagination.current !== this.pagination.total);
    }

    /**
     * Return true if there are models on the previous page.
     *
     * @returns {Boolean}
     */
    hasPreviousPage() {
        return this.pagination.current !== this.pagination.first;
    }

    /**
     * Get models for the next page.
     */
    getNextPage() {
        this.reset(this.getPage(this.pagination.current + 1));
    }

    /**
     * Get models for the previous page.
     */
    getPreviousPage() {
        this.reset(this.getPage(this.pagination.current - 1));
    }

    /**
     * Get models for a page number.
     *
     * @param {Number} page
     * @returns {Array} models
     */
    getPage(page) {
        // Calculate offset
        const offset = this.getOffset(page);
        const end    = (offset + this.pagination.perPage);

        // Save the current page number
        this.pagination.current = page;

        // Slice the models
        return this.fullCollection.models.slice(offset, end);
    }

    /**
     * Calculate the offset number of a page.
     *
     * @param {Number} page - page number
     * @returns {Number}
     */
    getOffset(page) {
        const offsetPage = (this.pagination.first === 0 ? page : page - 1);
        return (offsetPage * this.pagination.perPage);
    }

    /**
     * Navigate to the next model.
     *
     * @param {String} id - ID of a model
     * @fires Radio#model:navigate
     * @fires Radio#page:next if there are no models on the page
     */
    navigateNextModel(id) {
        const model = this.get(id);
        const index = model ? this.indexOf(model) + 1 : 0;

        if (index <= this.models.length - 1) {
            this.channel.trigger('model:navigate', {model: this.at(index)});
        }
        // If it is the last model on the page, navigate to the next page
        else if (this.hasNextPage()) {
            this.channel.trigger('page:next');
        }
        else {
            this.channel.trigger('page:end');
        }
    }

    /**
     * Navigate to the previous model.
     *
     * @param {String} id - ID of a model
     * @fires Radio#model:navigate
     * @fires Radio#page:previous if there are no models on the page
     */
    navigatePreviousModel(id) {
        const model = this.get(id);
        const index = model ? this.indexOf(model) - 1 : this.models.length - 1;

        if (index >= 0) {
            this.channel.trigger('model:navigate', {model: this.at(index)});
        }
        // If it is the first model on the page, navigate to the previous page
        else if (this.hasPreviousPage()) {
            this.channel.trigger('page:previous');
        }
        else {
            this.channel.trigger('page:start');
        }
    }

}
