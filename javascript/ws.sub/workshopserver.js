const WebSocket = require('ws');
var http = require('http');
var url = require('url');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("./static");
var blocks = {};

var server = http.createServer(function(req, resp) {

    const pathname = url.parse(req.url).pathname;
    if('/set' == pathname &&
       "POST" == req.method) {
            var postData = '';
            // Get all post data when receive data event.
            req.on('data', function (chunk) {
                postData += chunk;
            });

            // When all request post data has been received.
            req.on('end', function () {
                console.log("Client post data : " + postData);
                try {
		    var b = JSON.parse(postData);
		    blocks = Object.assign(blocks, b);
		} catch (e) {
		    resp.writeHead(400, {'Access-Control-Allow-Origin':'*'});
		    resp.end('Error');
		    return;
		}
                resp.writeHead(204, {'Access-Control-Allow-Origin':'*'});
		resp.end('OK');
		wss.broadcast(blocks);
            });
	return;
    }

    var done = finalhandler(req, resp);
    serve(req, resp, done);
});

server.listen(8000);


const wss = new WebSocket.Server({ noServer: true });
 
server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;
 
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send(JSON.stringify(blocks));
  });

    ws.send(JSON.stringify(blocks));
});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
    data = JSON.stringify(data);
    console.log("wss.broadcast:");
    console.log(data);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
