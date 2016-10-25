import _ from 'underscore';
import {readFileSync as read} from 'fs';

/**
 * Override the template property of a View.
 * This file exists because both Babel and commonjs cannot handle underscore
 * template files.
 *
 * @param {Object} View
 * @param {String} path - the relative path to a template
 */
export default function overrideTemplate(View, path) {
    const tmpl = read(`${__dirname}/../../app/scripts/${path}`);
    Object.defineProperty(View.prototype, 'template', {
        get: () => _.template(tmpl),
    });
}
