function esprfid(host, cb) {
    this.ws = null;
    this.host = host;
    this.healthy = false;
    this.cb = cb;
    window.setInterval(this.ping.bind(this),5000);
    this.wsstart();
}

esprfid.prototype = {
    connected: function() {},
    reconnect: function() { window.setTimeout(this.wsstart.bind(this),300); },
    onmsg: function(e) {
	this.healthy = true;
	try {
	    m=JSON.parse(e.data);
	} catch (q) {
	    alert(e.data);
	}
	this.cb(m);
    },
    ping: function() {
	if (!this.healthy) { // no signal since last ping
	    this.ws.close();
	}
	this.healthy = false;
	try {
	    this.ws.send(''); // if this fails, we'll close next time
	} catch (e) {}
    },
    wsstart: function() {
	this.ws = new WebSocket(this.host);
	this.ws.onopen = this.connected;
	this.ws.onclose = this.ws.onerror = this.reconnect.bind(this);
	this.ws.onmessage = this.onmsg.bind(this);
    }
};
