// Create a new Express application
var app = express();

// Create an http server with Node's HTTP module. 
// Pass it the Express application, and listen on port 8080. 
var server = require('http').createServer(app).listen(8080);

// Instantiate Socket.IO hand have it listen on the Express/HTTP server
var io = require('socket.io').listen(server);
