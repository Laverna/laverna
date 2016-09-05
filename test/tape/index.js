import jsdom from 'jsdom';
import {readFileSync as read} from 'fs';
import glob from 'glob';

/**
 * Create DOM environment.
 */
jsdom.env({
    html : read(`${__dirname}/../../app/index.html`, 'utf8'),

    done : (err, window) => {
        global.window   = window;
        global.document = window.document;

        // Automatically require all test files
        glob.sync(`${__dirname}/**/*.js`)
        .filter(file => file.indexOf('index.js') === -1)
        .forEach(file => require(file));
    },
});
