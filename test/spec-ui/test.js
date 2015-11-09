/* global describe, it */
'use strict';

// Test files
var tests = [
    './load.js',
    './apps/notes/form.js',
    './apps/notes/list.js',
    './apps/notes/show.js',
    './apps/notebooks/form.js',
    './apps/notebooks/list.js',
    './apps/notebooks/remove.js',
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
