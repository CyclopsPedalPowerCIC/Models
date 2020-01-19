function gebi(id) { return document.getElementById(id); }

function switch_pressed(s) {
    console.log(`switch ${s} pressed`);
    set_metric((metric+(s==1?1:-1)+metrics.length)%metrics.length);
}

//var blocks = {};
//var metrics = ["economy", "society", "environment"];
var cat_name=[];
function change(e) {
    var n=e.target.valueAsNumber;
    //console.log(e);
    var id=e.target.id+"_value";
    //console.log(id);
    var name = cat_name[parseInt(e.target.id.match(/([0-9]+)/))];
    if (!name) alert("FAIL");
    if (block) {
	block[name] = n;
	do_update();
    }
    gebi(id).innerHTML=n>0?`+${n}`:n;
}

function init_cats() {
    //gebi("cat1").addEventListener("input", change);
    var id=0;
    for (let top of metrics) {
	var el=gebi(metric_to_blk(top));
	el.getElementsByTagName("h1")[0].innerHTML=top;
	if (!el) alert(top);
	el=el.getElementsByClassName("cats")[0];
	if (!el) alert(top);
	for (m of Object.keys(game.parents))
	    if (game.parents[m]==top) {
		var c = document.createElement('div');
		c.className="cat";
		cat_name[id] = m;
		c.innerHTML = `
	  <label for="cat_${id}">${m}</label>
	  <input id="cat_${id}" type="range" min="-5" max="5"
	  step="1"></input>
	  <span id="cat_${id}_value" class="cat_value"></span>
	  </input>
`;
		el.appendChild(c);
		gebi(`cat_${id}`).addEventListener("input", change);
		++id;
	    }
    }

    //var cat = gebi("cat1");
/*    for (var j=0; j<ncats; j++) {
	var c = document.createElement('div');
	c.innerHTML = `<h3>${categories[j]}</h3>`;
	cat.appendChild(c);
	for (var i=1; i<=5; i++) {
	    var input = document.createElement('input');
	    input.type = 'radio';
	    input.name = `cat${j}`;
	    var id =`id${i}c${j}`;
	    input.id = id;
	    input.value = i;
	    input.checked = false;
	    (function(i,j) {input.addEventListener('click', function() { select(i,j); }, false); })(i,j);
	    var label = document.createElement('label');
	    label.htmlFor = id;
	    var name = i;
	    label.innerHTML = i;
	    c.appendChild(label);
	    c.appendChild(input);
	}
    }
*/
    gebi("name").addEventListener('input', update_name, false);
}

//function init_leds() {
//    gebi("col").addEventListener('change', update_col, false);
//}

function metric_to_blk(m) {
    return ({"Environment":"blk1",
      "Society":"blk2",
      "Economy":"blk3",
     })[m];
}
	
var metric = '';
function set_metric(n) {
    metric = n;
    //gebi("metric").innerHTML=metrics[metric];
    for (let m of metrics) {
	gebi(metric_to_blk(m)).classList[m == metrics[metric] ? "add" : "remove"]("highlight");

	gebi("blk7").style.left =
	    ({"blk1":"6%",
	      "blk2":"36%",
	     "blk3":"66%",
	     })[metric_to_blk(metrics[metric])];
    }
/*
    metric = metrics[n];
  console.log(`metric=${metric}`);
  for (var i = 0; i < metrics.length; i++)
    gebi(`blk${i + 1}`).classList[i == n ? "add" : "remove"]("highlight");
  set_lights();
*/
    do_update();
}


function update_col(rgb) {
    //var rgb = parseInt(gebi("col").value.slice(1),16);
    var a = new Uint8Array(3);
    var ptr=0;
    a[ptr++] = (rgb>>16)&0xff;
    a[ptr++] = (rgb>>8)&0xff;
    a[ptr++] = (rgb)&0xff;
    esp.send(a);
}

function update_name() {
    block.name = gebi("name").value;
    console.log(`saved name ${block.name}`);
    update_block();
}
function save_block() {
    block.name = gebi("name").value;
    update_block();
}

function select(i,j) {
    block.categories[categories[j]]=i;
    console.log(`saved ${i} ${j}`);
    update_block();
}

function update_block() {
//    gebi("out").innerHTML="<pre>"+JSON.stringify(block,null,2)+"</pre>";
    gebi("name").value = block.name;
    for (var c=0; c<cat_name.length; c++) {
	var v=block[cat_name[c]] || 0;
	var e = `cat_${c}`;
	console.log(e);
	var el=gebi(e);
	el.value = v;
	change({target:el});
	
    }
    // for (var j=0; j<categories.length; j++) {
    // 	for (var i=1; i<5; i++) {
    // 	    var id=`id${i}c${j}`;
    // 	    console.log(`id ${id}`);
    // 	    gebi(id).checked = (i==block.categories[categories[j]]);
    // 	}
    // }
    
    //gebi("stats").innerHTML = `${Object.keys(blocks).length} block(s)`;
}

var blkid = '123';
function set_rfid(c) {
    console.log(`block is ${c}`);
    if (c == 'eeeeeeee') alert("RFID reader hardware failure");
    
    if (c == 'eeeeeeee' || c == '00000000' || c == blkid)
	return;
    blocks[blkid] = block;
    blkid = c;
    block = blocks[blkid] || {name:""};
    gebi("id").innerHTML = blkid;
    do_update();
    update_block();
}

var Block = function(id) {
    var blk = this;
    blk.id = id;
    blk.name = 'New';
    blk.categories = {};
}

var debug = false;
function keyevent(e) {
    /*
    switch (e.key) {
    case 'd':
        debug=!debug;
        console.log(`debug ${debug}`);
        gebi("d1").style.display = debug?"block":"none";
        break;
    }
    */
}

var boardhost = '';

window.onload = function() {
    boardhost=window.location.search.replace(/^\?/,"");
    if (!boardhost) {
	boardhost = "codecraft"+parseInt(prompt("Board number?"));
    }
    console.log(`boardhost=${boardhost}`);
    gebi("boardhost").innerHTML=boardhost;
    comms_init();
    init_cats();
    //init_leds();
    set_metric(0);
    window.onkeypress = keyevent;
};

{
    let requests = 0;
    function fire_and_forget_post (target, data) {
        //console.log(target);
        if (requests < 2) {
            let xhr = new XMLHttpRequest();
            xhr.open('POST', target, true);
            xhr.timeout = 5000; // ms
            xhr.onload = xhr.onerror =
                xhr.ontimeout = ()=>requests--;
            requests++;
            xhr.send(data);
        } else {
            console.log(`no: requests=${requests}`);
        }
    }
}
/*
gebi("push").addEventListener("click", function() {
    if (blkid && blocks[blkid] && validate_block(blocks[blkid])) {
	fire_and_forget_post("http://codecraft:8000/set", `{"${blkid}":${JSON.stringify(blocks[blkid])}}`);
    }
});
*/
//gebi("indent").addEventListener("click", set_code);
/*			      
function validate_block(blk) {
    console.log(`validate_block: ${JSON.stringify(blk)}`);
    if (typeof blk !== "object")
	return false;
    for (let m of metrics) {
	console.log(`${m} => ${blk[m]}`);
	if (!isFinite(blk[m]) || blk[m] < 1 || blk[m] > 5)
	    return false;
    }
    console.log("VALID");
    return true;
}
*/
var block={"Individual Wellbeing":2,"Circular economies":1};
function do_update() {
    // called when syntax check passes
    if (blkid && block
	//	&& validate_block(block[blkid]
       ) {
	blocks[blkid] = block;
	console.log("ok");
	console.log(block);
	var mt = score_tiles([block]);
	console.log(mt);
	console.log(metric);
	update_col(get_orb_colour(mt));
	for (let m of metrics) {
	    let el = gebi(metric_to_blk(m));
	    if (!el) alert(m);
	    el = el.getElementsByClassName("value")[0];
	    el.innerHTML = format_score(mt[m]);
	}
	
    } else {
	update_col(0);
	//gebi("name").style.display="none";
    }
}
