const WebSocket = require('ws');
var http = require('http');
var url = require('url');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("./static");
var blocks = {};

var fs=require("fs");
var dir="tiles/";

function ls() {
    var ret={};
    fs.readdirSync(dir).forEach(file => {
	if (!file.match(/\.json$/)) return;
	var stat=fs.statSync(dir+file);
	var mtime=stat.mtime;//mtimeMs
	//console.log(stat);
	var l=null;
	try {
	    var contents = fs.readFileSync(dir+file);
	    var b=JSON.parse(contents);
	    l=Object.keys(b).length;
	} catch(e) {console.log(`error reading ${dir+file}`);}
	ret[file] = {mtime:mtime, len:l};

	//console.log(contents);
    });
    return JSON.stringify(ret);
}

function del(file) {
    if (!file) throw "need filename";
    fs.unlink(dir+file);
    console.log(`deleted ${file}`);
}

function load(file) {
    if (!file) throw "need filename";
    var contents = fs.readFileSync(dir+file);
    blocks=JSON.parse(contents);
    console.log(`loaded ${file}`);
    wss.broadcast(blocks);
}

function save(file, obj) {
    if (!file) throw "need filename";
    // some sanity checking here would not go amiss
    fs.writeFileSync(dir+file, JSON.stringify(obj));
    console.log(`saved ${file}`);
}

var server = http.createServer(function(req, resp) {
    const paths = {
	"/set": (data)=>{
	    console.log("set called");
	    console.log(data);
	    try {
		var b = JSON.parse(data);
	    } catch (e) { console.log(e); }
	    console.log(b);
	    blocks = Object.assign(blocks, b);
	    resp.writeHead(204, {'Access-Control-Allow-Origin':'*'});
	    resp.end('OK');
	    wss.broadcast(blocks);
	},
	"/save": (data)=>{
	    console.log("save");
	    save(data, blocks);
	    resp.writeHead(204, {'Access-Control-Allow-Origin':'*'});
	    resp.end('OK');
	},
	"/load": (data)=>{
	    console.log("load");
	    load(data);
	    resp.writeHead(204, {'Access-Control-Allow-Origin':'*'});
	    resp.end('OK');
	},
	"/del": (data)=>{
	    console.log("del");
	    del(data);
	    resp.writeHead(204, {'Access-Control-Allow-Origin':'*'});
	    resp.end('OK');
	},
	"/ls": ()=>{
	    resp.writeHead(200, {'Access-Control-Allow-Origin':'*','Content-Type':'application/json', 'Cache-Control':'no-cache'});
	    resp.end(ls());
	},
	"/get": ()=>{
	    resp.writeHead(200, {'Access-Control-Allow-Origin':'*','Content-Type':'application/json', 'Cache-Control':'no-cache'});
	    resp.end(JSON.stringify(blocks));
	},
    };
    
    const pathname = url.parse(req.url).pathname;

    if (paths[pathname]) {
	var cb = paths[pathname];
	if ("POST" == req.method) {
            var postData = '';
            // Get all post data when receive data event.
            req.on('data', function (chunk) {
                postData += chunk;
            });

            // When all request post data has been received.
            req.on('end', function () {
                try {
		    cb(postData);
		} catch (e) {
		    resp.writeHead(400, {'Access-Control-Allow-Origin':'*'});
		    resp.end('Error');
		}
		return;
            });
	    return;
	} else if ("GET" == req.method) {
            try {
		cb();
	    } catch (e) {
		resp.writeHead(400, {'Access-Control-Allow-Origin':'*'});
		resp.end('Error');
	    }
	    return;
	}
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
    //console.log('received: %s', message);
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
