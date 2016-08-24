import jsdom from 'jsdom';
import {readFileSync as read} from 'fs';

/**
 * Create DOM environment.
 */
jsdom.env({
    html : read(`${__dirname}/../../app/index.html`, 'utf8'),

    done : (err, window) => {
        global.window   = window;
        global.document = window.document;

        require('./app');
    },
});
