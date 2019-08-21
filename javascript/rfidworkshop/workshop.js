function gebi(id) { return document.getElementById(id); }

function switch_pressed(s) {
    console.log(`switch ${s} pressed`);
}

var blocks = [];
var categories = ["abc", "def", "eghi"];

function init_cats() {
    var ncats = 3;
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
}

function init_leds() {
    gebi("col").addEventListener('change', update_col, false);
}

function update_col() {
    var rgb = parseInt(gebi("col").value.slice(1),16);
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
    gebi("id").innerHTML = `id ${block.id}`;
    
}

function set_rfid(c) {
    console.log(`block is ${c}`);
    if (c == 'eeeeeeee' || c == '00000000')
	return;

    if (!blocks[c])
	blocks[c] = new Block(c);

    block = blocks[c];
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
    switch (e.key) {
    case 'd':
        debug=!debug;
        console.log(`debug ${debug}`);
        gebi("d1").style.display = debug?"block":"none";
        break;
    }
}

window.onload = function() {
    comms_init();
    init_cats();
    init_leds();
    window.onkeypress = keyevent;
};

