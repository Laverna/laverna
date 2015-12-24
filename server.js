'use strict';
const PORT  = 9100;
var connect = require('connect');

connect()
.use(connect.static(__dirname + '/dist'))
.listen(PORT);

console.log('Server is running on port: ' + PORT);
