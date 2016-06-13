//provices HTTP server and client funtionality
var http = require('http');
//provides filesystem related functionality
var fs = require('fs');
//provides filesystem path related functionalt8y
var path = require('path');
//provides ability to dervice MIME type bases on filename extension
var mime = require('mime');
//stores contents of cached files
var cache = {};

var chatServer = require('./lib/chat_server');


//sends back an error if the file doesn't exist
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

//serves file data
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

//determine whether a file is cached, and if so, accesses it
function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response)
			}
		});
	}
}

//create HTTP server
var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
})

server.listen(3000, function() {
	console.log("server listening on port 3000.");
})

chatServer.listen(server);
