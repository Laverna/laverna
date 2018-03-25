/**
 * @module components/importExport/ImportEvernote
 */
import Import from './Import';
import Radio from 'backbone.radio';
import _ from 'underscore';
import convert from 'xml-js';
import base64js from 'base64-js';
import Turndown from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import deb from 'debug';
import md5 from 'js-md5';

const log = deb('lav:components/importExport/ImportEvernote');

/**
 * Import data from Evernote's .enex backup file to Laverna.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class ImportEvernote extends Import {

    init() {
        if (this.checkFiles()) {
            return this.importData();
        }

        return Promise.resolve(false);
    }

    onSuccess() {
        log('completed');
        this.channel.trigger('completed');
        this.destroy();
        return true;
    }

    onError(error) {
        log('error', error);
        this.channel.trigger('completed', {error});
        this.destroy();
        return false;
    }

    /**
     * Return "true" if either a backup file or XML was provided.
     *
     * @returns {Boolean}
     */
    // eslint-disable-next-line complexity
    checkFiles() {
        return (
            !!(this.options.xml && this.options.xml.length) ||
            !!(this.options.files && this.options.files.length && this.checkEnex())
        );
    }

    /**
     * Check if a file is an .enex backup.
     *
     * @param {Object} file=this.options.files[0]
     * @returns {Boolean}
     */
    checkEnex(file = this.options.files[0]) {
        return (_.last(file.name.split('.')) === 'enex' && file.size > 0);
    }

    /**
     * Start importing data from Evernote backup.
     *
     * @returns {Promise}
     */
    async importData() {
        // Trigger an event that import proccess started
        this.channel.trigger('started');

        try {
            const xml = await this.getXml();
            const data = await this.xml2js(xml);
            await this.importElements(data);
            return this.onSuccess();
        }
        catch (e) {
            return this.onError(e);
        }
    }

    /**
     * Convert XML to a JavaScript object.
     *
     * @param {String} xml
     * @returns {Array} returns the first element's elements
     */
    xml2js(xml) {
        return convert.xml2js(xml, {
            ignoreDoctype     : true,
            ignoreDeclaration : true,
        }).elements[0].elements;
    }

    /**
     * If XML was already provided, return it. Otherwise, read the provided file.
     *
     * @returns {Promise} resolves with string
     */
    getXml() {
        if (this.options.xml) {
            return Promise.resolve(this.options.xml);
        }

        return this.readText(this.options.files[0]);
    }

    /**
     * Import elements from Evernote backup.
     *
     * @param {Array} data
     * @returns {Promise}
     */
    importElements(data) {
        let promise = Promise.resolve();

        _.each(data, item => {
            if (item.name === 'note') {
                promise = promise.then(() => this.importNote(item.elements));
            }
        });

        return promise;
    }

    /**
     * Import a note from Evernote backup.
     *
     * @param {Array} elements - note elements
     * @returns {Promise}
     */
    async importNote(elements) {
        const data = this.parseData(elements);
        log('note data', data);

        const mData = await Radio.request('components/markdown', 'parse', data.note);
        const note  = _.extend(data.note, mData);

        return Promise.all([
            Radio.request('collections/Tags', 'addTags', {tags: data.note.tags}),
            Radio.request('collections/Files', 'addFiles', {files: data.files}),
            Radio.request('collections/Notes', 'saveModelObject', {
                data         : note,
                dontValidate : true,
                saveTags     : true,
            }),
        ]);
    }

    /**
     * Parse Evernote note data.
     *
     * @param {Object} elements - note elements
     * @returns {Object}
     */
    parseData(elements) {
        const note = {title: this.findTextAttr(elements, 'title')};

        // File attachments
        const files = this.parseFiles(elements);
        note.files  = _.pluck(files, 'id');

        // Content
        note.content = this.parseContent(elements, files);

        // Tags
        const tags   = _.where(elements, {name: 'tag'});
        note.tags    = _.map(tags, tag => this.getTextAttr(tag));
        note.content = `#${note.tags.join(' #')}\n\n${note.content}`;

        return {note, files};
    }

    /**
     * Parse Evernote note's content.
     *
     * @param {Array} elements
     * @param {Array} files
     * @returns {String}
     */
    parseContent(elements, files) {
        let content = _.findWhere(elements, {name: 'content'});
        content     = _.findWhere(content.elements, {type: 'cdata'}).cdata;

        const obj = convert.xml2js(content, {
            ignoreDoctype     : true,
            ignoreDeclaration : true,
        }).elements[0];

        // Create correct attachment links
        /* eslint-disable no-param-reassign */
        _.each(this.findMedia(obj), item => {
            const file = _.findWhere(files, {id: item.attributes.hash}) || {};

            if (item.attributes.type.search(/^image/) !== -1) {
                item.name       = 'img';
                item.attributes = {
                    src: `#file:${item.attributes.hash}`,
                    alt: file.name,
                };
            }
            else {
                item.name       = 'a';
                item.attributes = {href: `#file:${item.attributes.hash}`};
                item.elements   = [{type: 'text', text: file.name}];
            }
        });
        /* eslint-enable */

        // Convert todo lists
        content = convert.json2xml(obj)
        .replace(/<en-todo( checked="false")?\/>/g, '[] ')
        .replace(/<en-todo checked="true"\/>/g, '[x] ');

        // Convert to Markdown
        const md = new Turndown();
        md.use(gfm);

        return md.turndown(content)
        .replace(/\n{2,}/g, '\n')
        .replace(/\\+\[/g, '[')
        .replace(/\\+\]/g, ']');
    }

    /**
     * Find media attachments in content.
     *
     * @param {Object} obj - content
     * @returns {Array}
     */
    findMedia(obj) {
        let media  = _.where(obj.elements, {name: 'en-media'});

        // Find media attachments inside of div elements
        const divs = _.where(obj.elements, {name: 'div'});
        _.each(divs, div => {
            const dMedia = _.where(div.elements, {name: 'en-media'});
            if (dMedia && dMedia.length) {
                media = media.concat(dMedia);
            }
        });

        return media;
    }

    /**
     * Parse file attachments.
     *
     * @param {Array} elements
     * @returns {Array}
     */
    parseFiles(elements) {
        let files = _.where(elements, {name: 'resource'});
        files     = _.map(files, file => {
            let name = _.findWhere(file.elements, {name: 'resource-attributes'});
            name     = this.findTextAttr(name.elements, 'file-name');

            const data = {
                name,
                src      : this.findTextAttr(file.elements, 'data'),
                fileType : this.findTextAttr(file.elements, 'mime'),
            };

            // Create the ID
            data.src     = data.src.replace(/(\r|\n)+/g, '').trim();
            const binary = base64js.toByteArray(data.src);
            data.id      = md5.create().update(binary).hex(); // eslint-disable-line

            data.src = `data:${data.fileType};base64,${data.src}`;

            return data;
        });

        return files;
    }

    /**
     * Find and return a text attribute.
     *
     * @param {Object} elements
     * @param {String} name - attribute name
     * @returns {String}
     */
    findTextAttr(elements, name) {
        const data = _.findWhere(elements, {name});
        return data ? this.getTextAttr(data) : '';
    }

    /**
     * Return text attribute.
     *
     * @param {Object} data
     * @param {Array} data.elements
     * @returns {String}
     */
    getTextAttr(data) {
        const text = _.findWhere(data.elements, {type: 'text'});
        return text ? text.text : '';
    }

}
