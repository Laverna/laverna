'use strict';
const PORT  = 9100;
var nStatic = require('node-static'),
    http    = require('http'),
    file    = new nStatic.Server('./dist');

http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(PORT);

console.log('Server is running on port: ' + PORT);
