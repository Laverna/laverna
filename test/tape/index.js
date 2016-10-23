import jsdom from 'jsdom';
import {readFileSync as read} from 'fs';
import glob from 'glob';
import {LocalStorage} from 'node-localstorage';

global.localStorage = new LocalStorage(`${__dirname}/../../_dev/scratch`);

/**
 * Create DOM environment.
 */
jsdom.env({
    url  : 'http://localhost/#',
    html : read(`${__dirname}/../../app/index.html`, 'utf8'),

    done : (err, window) => {
        global.window    = window;
        global.location  = window.location;
        global.document  = window.document;
        global.window.localStorage = global.localStorage;

        // Automatically require all test files
        glob.sync(`${__dirname}/**/*.js`)
        .filter(file => file.indexOf('index.js') === -1)
        .forEach(file => require(file));
    },
});
