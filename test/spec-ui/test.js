/* global describe, it */
'use strict';

// Test files
var tests = [
    './load.js',

    // Test notes
    './apps/notes/form.js',
    './apps/notes/list.js',
    './apps/notes/show.js',

    // Test notebooks
    './apps/notebooks/form.js',
    './apps/notebooks/list.js',
    './apps/notebooks/remove.js',

    // Test tags
    './apps/tags/form.js',
    './apps/tags/list.js',
    './apps/tags/remove.js',

    // Test navbar
    './apps/navbar/navbar.js',
    './modules/fuzzySearch/fuzzySearch.js',

    // Test settings
    './apps/settings/general.js',
    './apps/settings/keybindings.js',
    './apps/settings/profiles.js',
    './apps/settings/import.js',

    // Test encryption
    './apps/encryption/encrypt.js',
];

// Load all test files
tests.forEach(function(val) {
    require(val);
});

describe('end session', function() {
    it('ends session', function(client) {
        client.end();
    });
});
