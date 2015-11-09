'use strict';

// Test files
var tests = [
    './load.js',
    './apps/notes/form.js',
    './apps/notebooks/form.js',
    './apps/notebooks/list.js',
    './apps/notebooks/remove.js',
    './apps/tags/form.js',
    './apps/tags/list.js',
    './apps/tags/remove.js',
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
