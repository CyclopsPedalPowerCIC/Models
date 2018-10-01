function esprfid(host, cb) {
    this.ws = null;
    this.host = host;
    this.healthy = 0; // 0 = definitely dead, 1 = awaiting pong, 2 = good
    this.cb = cb;
    window.setInterval(this.ping.bind(this),5000);
    this.wsstart();
    this.lastmsg = null;
    this.outdata = null;
}

esprfid.prototype = {
    connected: function() {
	this.healthy = 1;
	if (this.outdata)
	    this.ws.send(outdata);
    },
    reconnect: function() {
	this.healthy = 0;
	window.setTimeout(this.wsstart.bind(this),300);
    },
    onmsg: function(e) {
	this.healthy = 2;
	if (this.lastmsg != e.data) {
	    this.lastmsg = e.data;
	    try {
		m=JSON.parse(e.data);
	    } catch (q) {
		alert(e.data);
	    }
	    this.lastjson = m;
	    if (this.cb)
		this.cb(m);
	}
    },
    send: function(d) {
	this.outdata = d; // data to send
	this.ws.send(outdata);
    },
    
    ping: function() {
	if (this.healthy < 2) { // no signal since last ping
	    this.healthy = 0;
	    this.ws.close();
	}
	this.healthy = 1;
	try {
	    this.ws.send(''); // if this fails, we'll close next time
	} catch (e) {}
    },
    wsstart: function() {
	this.ws = new WebSocket(`ws://${this.host}:81/`);
	this.ws.onopen = this.connected;
	this.ws.onclose = this.ws.onerror = this.reconnect.bind(this);
	this.ws.onmessage = this.onmsg.bind(this);
    }
};

var ws_objs= [];

function citymodel() {
    var hosts = [
	"192.168.1.146",
	"rfid2",
//	"rfid3",
//	"rfid4",
//	"rfid5",
//	"rfid6",
//	"citymaster",
    ];
    for (var h of hosts) {
	ws_objs.push(new esprfid(h, update_models));
    }
}

function update_models() {
    var rfids = [].concat.call(
	Array.map(ws_objs, (w)=>w.lastjson) // FIXME: but not master
    );
    console.log(rfids);
}
    
setInterval(check_health, 1000);
function check_health() {
    var err = [];
    for (var w of ws_objs) {
	if (!w.healthy) {
	    err.push(w.host);
	}
    }
    var alerter = gebi("alerter");
    alerter.style.display = err.length ? 'block' : 'none';
    alerter.innerHTML=err.length ? `${err.length} unhealthy: ${err.join(", ")}`: '';
}
