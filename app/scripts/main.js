/**
 * @file main.js - load dependencies and start the app.
 * @license MPL-2.0
 */
import FastClick from 'fastclick';
import Hammer from 'hammerjs';
import deb from 'debug';

const log = deb('lav:main');

document.addEventListener('DOMContentLoaded', () => {
    // Enable debugging
    deb.enable('lav*');
    log('DOM is ready');

    // Remove 300ms delay
    FastClick.attach(document.body);

    // Enable text selection
    delete Hammer.defaults.cssProps.userSelect;
});
