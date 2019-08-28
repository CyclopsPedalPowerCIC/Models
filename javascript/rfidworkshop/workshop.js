function gebi(id) { return document.getElementById(id); }

function switch_pressed(s) {
    console.log(`switch ${s} pressed`);
    set_metric((metric+(s==1?1:-1)+metrics.length)%metrics.length);
}

var blocks = {};
var metrics = ["recycle", "reduce", "reuse"];

function init_cats() {
/*    var ncats = 3;
    var cat = gebi("cat");
    for (var j=0; j<ncats; j++) {
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
    gebi("name").addEventListener('change', update_name, false);
*/
}

//function init_leds() {
//    gebi("col").addEventListener('change', update_col, false);
//}

var metric = '';
function set_metric(n) {
    metric = n;
    gebi("metric").innerHTML=metrics[metric];
/*
    metric = metrics[n];
  console.log(`metric=${metric}`);
  for (var i = 0; i < metrics.length; i++)
    gebi(`blk${i + 1}`).classList[i == n ? "add" : "remove"]("highlight");
  set_lights();
*/
    do_update();
}

function get_orb_colour(obj) {
  var value = null;
  //console.log(obj);
  if (obj && obj[metrics[metric]] !== null) {
    value = obj[metrics[metric]];
    if (!isFinite(value)) value = null;
    else {
      value = 2 * (value - 1); // map from 1-5 to 0-8
      //value += 4; // map from -5-5 to 0-8
      if (value < 0) value = 0;
      if (value > 8) value = 8;
      value |= 0;
    }
  }
    console.log(`value=${value}`);
  //value goes from 0-8
  var orb_colours = [
    //modified version to make the real life colours better (no blue, more full saturated r/g
    0xe00000,
    0xff4000,
    0xff8000,
    0xffc000,
    0xffe700,
    0xffff00,
    0xc2ff00,
    0x79ff00,
    0x00ff00
  ];
  //console.log(`orb ${value}`);
  var rgb = value === null ? 0x000000 : orb_colours[value];
  return rgb;
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
/*
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
    gebi("out").innerHTML="<pre>"+JSON.stringify(block,null,2)+"</pre>";
    gebi("name").value = block.name;
    for (var j=0; j<categories.length; j++) {
	for (var i=1; i<5; i++) {
	    var id=`id${i}c${j}`;
	    console.log(`id ${id}`);
	    gebi(id).checked = (i==block.categories[categories[j]]);
	}
    }
    
    gebi("stats").innerHTML = `${Object.keys(blocks).length} block(s)`;
}
*/

var blkid = '123';
function set_rfid(c) {
    console.log(`block is ${c}`);
    if (c == 'eeeeeeee' || c == '00000000')
	return;
    //gebi("code").innerHTML =
    misbehave.update(
	{prefix:(
	blocks[c] ? 
	JSON.stringify({[c]:blocks[c]},null,2)
	    : "")
	 ,suffix:'',selected:''});

    blkid = c;
    //block = blocks[c];
    gebi("id").innerHTML = blkid;
    do_update();
    //update_block();
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
    init_syn();
    window.onkeypress = keyevent;
};

{
    let requests = 0;
    function fire_and_forget_post (target, data) {
        console.log(target);
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


var block=null;
function do_update(error) {
    //console.log(`error=${error}`);
    if (!error) {
	// called when syntax check passes
	
	if (blkid && block && block[blkid]) {
	    blocks[blkid] = block[blkid];
	    //console.log("ok");
	    //console.log(blocks[blkid]);
	    fire_and_forget_post("http://codecraft:8000/set", `{"${blkid}":${JSON.stringify(blocks[blkid])}}`);
	}
	//console.log(blocks[blkid]);
	update_col(get_orb_colour(blocks[blkid]));
    } else {
	update_col(0);
    }
}
