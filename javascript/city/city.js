function gebi(id) { return document.getElementById(id); }
function esprfid(host, cb) {
    this.ws = null;
    this.host = host;
    this.healthy = 0; // 0 = definitely dead, 1 = awaiting pong, 2 = good
    this.cb = cb;
    window.setInterval(this.ping.bind(this),10000);
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
	//console.log("reconnect");
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
	try {
	    this.ws.send(outdata);
	} catch (e) {}
    },
    
    ping: function() {
	if (!this.ws) {
	    console.log("returning "+this.host);
	    return;
	}
	//console.log("ping: "+this.host+" "+this.healthy);
	if (this.healthy == 1) { // no signal since last ping
	    this.healthy = 0;
	    this.ws.close();
	    this.ws = null;
	}
	try {
	    this.ws.send(''); // if this fails, we'll close next time
	    this.healthy = 1;
	} catch (e) {}
    },
    wsstart: function() {
	if (this.ws) console.log(`${this.host} readystate ${ws.readyState}`);
	try { this.ws.close(); } catch (e) {}
	//console.log("wsstart "+this.host);
	this.ws = new WebSocket(`ws://${this.host}:81/`);
	this.ws.onopen = this.connected;
	this.ws.onclose = this.ws.onerror = this.reconnect.bind(this);
	this.ws.onmessage = this.onmsg.bind(this);
    }
};

var ws_objs= [];

function citymodel() {
    var hosts = [
//	"esprfid1.local",
//	"esprfid2.local",
//	"192.168.0.140",

	"192.168.0.141",
	"192.168.0.142",
	"192.168.0.143",
	"192.168.0.144",
	"192.168.0.146",
	"192.168.0.147",
	
//	"citymaster",
    ];
    for (var h of hosts) {
	ws_objs.push(new esprfid(h, update_models));
    }
}

function update_models() {
//    var rfids = [].concat.call(
//	Array.map(ws_objs, (w)=>w.lastjson) // FIXME: but not master
    //    );
    var rfids = [];
    for (let o of ws_objs) {
	rfids=rfids.concat(o.lastjson);
    }
    //var rfids = ws_objs[0].lastjson;//FIXME
    //console.log(rfids.length);
    gebi("d1").innerHTML=rfids.join(", ");
    //console.log(rfids);
    set_cards(rfids);
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
