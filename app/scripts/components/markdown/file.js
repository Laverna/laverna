/**
 * File plugin for markdown-it.
 *
 * @module components/markdown/file
 */
/* eslint no-param-reassign: 0 */
import _ from 'underscore';

/**
 * @exports components/markdown/file
 * @license MPL-2.0
 */
const file = {

    /**
     * Regular expression to find file links.
     *
     * @prop {Object}
     */
    pattern: /\#file:([a-z0-9\-])+/, // eslint-disable-line

    /**
     * Object that contains the generated file URLs.
     *
     * @prop {Object}
     */
    urls: {},

    /**
     * Initialize markdown-it plugin.
     *
     * @param {Object} md - markdown-it instance
     */
    init(md) {
        file.md = md;
        /**
         * The original image rule.
         *
         * @prop {Function}
         */
        file.imageRule = file.md.renderer.rules.image;

        // Override link and image rules
        md.renderer.rules.link_open = _.bind(file.linkOpen, file); // eslint-disable-line
        md.renderer.rules.image     = _.bind(file.image, file);
    },

    /**
     * Override linkOpen rule with this.
     */
    linkOpen(...args) {
        const self = args[4];
        this.replaceLink(...args);
        return self.renderToken(...args);
    },

    /**
     * Override image rule with this.
     */
    image(...args) {
        this.replaceLink(...args);
        return this.imageRule(...args);
    },

    /**
     * Replace pseudo links that start with "#file:" with ObjectURLs.
     */
    replaceLink(tokens, idx, options, env) { // eslint-disable-line
        const token = tokens[idx];
        const type  = this.getAttrName(token);
        const attr  = token.attrs[token.attrIndex(type)];

        // Do nothing if it isn't a file link
        if (!this.pattern.test(attr[1])) {
            return;
        }

        const id = attr[1].match(this.pattern)[0].replace('#file:', '');

        // Save the ID of a file
        if (env) {
            env.files = env.files || [];
            env.files.push(id);
        }

        // Create object URLs only if file collection exists
        if (env.clonedFiles && env.clonedFiles.length) {
            this.create(attr, id, env);
        }
    },

    /**
     * Determine what attribute needs to be changed.
     *
     * @param {Object} token
     * @returns {String}
     */
    getAttrName(token) {
        return (token.type === 'image' ? 'src' : 'href');
    },

    /**
     * Create an object URL.
     *
     * @param {Array} attr
     * @param {String} id - ID of the file
     * @param {Object} env
     */
    create(attr, id, env) {
        const file = _.findWhere(env.clonedFiles, {id});

        if (!file) {
            return;
        }

        // Save the file URL
        this.urls[file.id] = file.url;
        attr[1] = file.url;
    },

    /**
     * Revoke all object URLs which aren't under use.
     *
     * @param {Object} data
     * @param {Array} [data.clonedFiles]
     */
    revoke(data) {
        const fileModels = data.clonedFiles || [];

        _.each(this.urls, (url, id) => {
            // If the model has the file model, do nothing
            if (_.findWhere(fileModels, {id})) {
                return;
            }

            // Revoke the URL
            (URL || window.webkitURL).revokeObjectURL(url);
            this.urls[id] = null;
        });
    },

};

export default file;
