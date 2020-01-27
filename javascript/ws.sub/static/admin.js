function get(url, body, cb) {
    req("GET", url, body, cb); 
}
function post(url, body, cb) {
    req("POST", url, body, cb); 
}
function req(method, url, body, cb) {
    var xhr=new XMLHttpRequest();
    wait(true);
    xhr.onload = ()=>{wait(false);if (((xhr.status/100)|0)==2) cb(JSON.parse(xhr.responseText)); else alert(`error ${xhr.status} ${method}'ing ${url}`); }
    xhr.open(method, url);
    xhr.send(body);
    xhr.onerror = ()=>{wait(false);alert("error sending request");}
}

function gebi(id) { return document.getElementById(id); }

var wait = (function () {
                var ref=1, w=gebi("spinner"), delay;
                return function(on) {
                    if (ref+=on?1:-1) {
                        if (!delay)
                            delay = window.setTimeout(function(){ w.style.display='block'; delay = null; }, 250);
                    } else {
                        w.style.display='none';
                        if (delay) {
                            window.clearTimeout(delay); delay = null;
                        }
                    }
                    //console.log("ref="+ref+ "("+on+")");
                }
            })();

function load(fn) {
    post("/load",fn, ()=>{});
    //alert(`load ${fn}`);

}

function save(fn) {
    post("/save",fn, ()=>{});
    do_list();
    //alert(`save ${fn}`);
}

function del(fn) {
    if (!confirm(`Really delete ${fn}?`)) return;
    post("/del",fn, ()=>{});
    do_list();
}

var list;

function do_list() {
    get("/ls", null, (ls)=>{
	list = ls;
	var el=gebi("list");
	el.innerHTML=`<tr>`+
	    `<th>Name</th>`+
	    `<th>Changed</th>`+
	    `<th>Tiles</th>`+
	    `</tr>`;
	
	var out="";
	console.log(ls);
	var l=[];
	for (var entry in ls) {
	    var e2=ls[entry];
	    e2.name=entry;
	    l.push(e2);
	}
	console.log(JSON.stringify(l));
	l.sort((a,b)=>(new Date(b.mtime)-new Date(a.mtime)));
	for (let t of l) {
	    console.log(t);
	    //let t=ls[fn];
	    let fn=t.name;//(t.name.match(/(.*)\.json$/))[1];
	    var tr=document.createElement("tr");
	    tr.innerHTML=`<td>${fn}</td>`+
		`<td>${t.mtime}</td>`+
		`<td>${Number.isFinite(t.len)?(t.len):"???"}</td>`+
		`<td><button>Load</button>`+
		`<button>Save</button>`+
		`<td><button>Delete</button>`+
		`</td>`;
	    var buts=tr.getElementsByTagName("button");
	    buts[0].onclick=()=>load(t.name);
	    buts[1].onclick=()=>confirm(`Overwrite ${t.name}?`)&&save(t.name);
	    buts[2].onclick=()=>del(t.name);
	    el.appendChild(tr);
	}
    }
       );
}

gebi("savenew").onclick = ()=>{
    var fn=gebi("fn").value;
    if (!fn)
	alert(`need filename`);
    else if (list[fn])
	alert(`${fn} already exists`);
    else
	save(fn);
};

function iframes_init() {
    var hosts = [ "192.168.0.150",
	      "192.168.0.151",
	      "192.168.0.152",
	      "192.168.0.153",
		];
    var out="";
    for (var i=0; i<4; i++) {
	var id=`if`+i;
	var n=i+1;
	var ip=hosts[i];
	out += `<div>${n} (${ip}) <a href=http://${ip} target=${id}>refresh</a> <a href=http://${ip}/reinit target=${id}>reinit</a> <iframe name=${id} src=http://${ip}></iframe></div>`;
    }
    gebi("debug").innerHTML = out+gebi("debug").innerHTML;
}
window.onload = function() {
    wait(false);
    do_list();
    var tab=tabs (["File", "Tiles", "Activity", "Debug"],
                ["file","tilelist","log","debug"].map(gebi), gebi("tab"), 0,
                  tabchanged);
    comms_init();
    iframes_init();
}

function tabchanged() {
}

function tabs (names, dests, bar, init, cb) {
    var t={tabs:[],
	   count:names.length,
	   click:function (n) {
	       for (var i=0; i<t.count; i++) {
		   t.tabs[i].src.className = (n == i) ? "selected" : "";
		   t.tabs[i].dest.style.display = (n == i) ? "block" : "none";
	       }
	       t.current=n;
	       if (t.changed) t.changed(t.current);
	   },
	   current:undefined,
	   changed:cb,
	  };

    for (var i=0; i<t.count; i++) {
	var l=document.createElement("li");
	var ll=document.createElement("a");
	ll.appendChild(document.createTextNode(names[i]));
	l.appendChild (ll);
	bar.appendChild (l);
	t.tabs[i] = { src:ll, dest:dests[i] };
	(function(i){ ll.onclick = function() { t.click(i); }})(i);
    }

    t.click (init);

    return t;
}
var blocks;
function update_blocks(b) {
    //console.log("update_blocks");
    //console.log(b);
    blocks = b;
    gebi("ntiles").innerHTML = Object.keys(blocks).length;

    var el=gebi("tiles");
    el.innerHTML = `<tr><th>ID</th><th>Name</th><th>Cats set</th>`;
    for (let id of Object.keys(blocks)) {
	let t=blocks[id];
	var tr=document.createElement("tr");
	tr.innerHTML=`<td>${id}</td>`+
	    `<td>${t.name||"???"}</td>`+
	    `<td>${(Object.keys(t).length)-1}</td>`;
	el.appendChild(tr);
    }
}

function comms_init() {
    var esp=new esprfid("codecraft:8000/ws", update_blocks);
}
    
