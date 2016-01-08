'use strict';
const PORT = 9100;

var finalhandler = require('finalhandler'),
    http         = require('http'),
    serveStatic  = require('serve-static'),
    serve,
    server;

serve  = serveStatic(__dirname + '/dist', {index: ['index.html']});

server = http.createServer(function(req, res) {
    var done = finalhandler(req, res);
    serve(req, res, done);
});

server.listen(PORT);

console.log('Server is running on port: ' + PORT);
