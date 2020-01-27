function gebi(id) { return document.getElementById(id); }

var esp, ws_objs=[];

function comms_init() {
//    var host="192.168.1.236";
//    var host="192.168.1.122";
//    var host="192.168.1.175";
    var host = `${boardhost}:81`;
    esp = new esprfid(host, update_models);
    blocks_esp = new esprfid("codecraft:8000/ws", update_blocks);
    ws_objs = [esp];
}

var lastrfid,lastsw;
function update_models() {
    //gebi("d1").innerHTML=rfids.join(", ");
    if (esp.lastjson.sw != lastsw) {
	lastsw = esp.lastjson.sw;
	if (lastsw) {
	    switch_pressed(Math.log2(lastsw)|0);
	}
    }
    if (lastrfid != esp.lastjson.rfid) {
	lastrfid = esp.lastjson.rfid;
	set_rfid(lastrfid);
    }
}

function update_blocks() {
    console.log(blocks_esp.lastjson);
    var tmp=blocks[blkid];
    //blocks = Object.assign (blocks, blocks_esp.lastjson);
    blocks = blocks_esp.lastjson;
    blocks[blkid]=tmp;
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
