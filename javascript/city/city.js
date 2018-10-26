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
	    this.ws.send(this.outdata);
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
	try {
	    this.ws.send(this.outdata);
	} catch (e) {}
    },
    
    ping: function() {
	if (!this.ws) {
	    //console.log("returning "+this.host);
	    return;
	}
	if (this.ws.readyState !== 1)
	    return;

	//console.log("ping: "+this.host+" "+this.healthy);
	if (this.healthy == 1) { // no signal since last ping
	    this.healthy = 0;
	    this.ws.close();
	    this.ws = null;
	}
	try {
	    if (this.ws.readyState==1) {
		this.ws.send(''); // if this fails, we'll close next time
		this.healthy = 1;
	    }
	} catch (e) {}
    },
    wsstart: function() {
	if (this.ws && !this.ws.readyState)
	    return;

	this.ws = new WebSocket(`ws://${this.host}:81/`);
	this.ws.onopen = this.connected.bind(this);
	this.ws.onclose = this.ws.onerror = this.reconnect.bind(this);
	this.ws.onmessage = this.onmsg.bind(this);
    }
};

var ws_objs= [], rfid_objs = [], citylights;

function citymodel() {
    var hosts = {
	"192.168.0.141":true,
	"192.168.0.142":true,
	"192.168.0.143":true,
	"192.168.0.144":true,
	"192.168.0.146":true,
	"192.168.0.147":true,
	
	"192.168.0.145":false,
    };
    for (let [h,is_rfid] of Object.entries(hosts)) {
	var esp = new esprfid(h, is_rfid?update_models:update_switches);
	ws_objs.push(esp);
	if (is_rfid)
	    rfid_objs.push(esp);
	else
	    citylights = esp;
    }
}

function update_switches() {
    console.log(`sw ${citylights.lastjson}`);
}

function update_models() {
    var rfids = [];
    for (let o of rfid_objs) {
	rfids=rfids.concat(o.lastjson);
    }
    //var rfids = ws_objs[0].lastjson;//FIXME
    //console.log(rfids.length);
    gebi("d1").innerHTML=rfids.join(", ");
    //console.log(rfids);
    set_cards(rfids);
}
    
setInterval(check_health, 1000);
var still_loading = true;
function check_health() {
    var err = [];
    for (var w of ws_objs) {
	if (!w.healthy) {
	    err.push(w.host);
	}
    }
    if (!err.length) {
	still_loading = false;
	gebi("loading").style.display="none";
    }
    if (still_loading) {
	gebi("progress").style.width = (1-err.length/ws_objs.length)*100+"%";
    }

    var alerter = gebi("alerter");
    alerter.style.display = (err.length && (still_loading===debug)) ? 'block' : 'none';
    alerter.innerHTML=err.length ? `${err.length} unhealthy: ${err.join(", ")}`: '';
}
