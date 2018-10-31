function gebi(id) { return document.getElementById(id); }

function make_orbs(id, n) {
    var el=gebi(id); if (!el) alert(id);
    for (var i=0; i<n; i++) {
	el.appendChild(document.createElement("li"));
    }
}

// mapping from readers to LEDs
var ledmap = [13,9,12,11,10,17,14,18,15,16,3,0,1,2,6,7,4,5,8,25,27,24,26,23,21,19,22,20];
// LEDs to write
var real_orbs = [], sent_real_orbs = [];

function set_orb(el, obj) {
    el.textContent = obj.name;
    el.style.backgroundPosition=`0px -${(obj.orb===null)?9999:(0|([0,54,107,161,215,270,325,381,436][obj.orb]*30/45))}px`;
    if (obj.source) {
	for (var i=0; i<obj.source.length; i++) {
	    //console.log(`set_real_orb: ${obj.source[i]} ${obj.orb}`);
	    real_orbs[ledmap[obj.source[i]]]=obj.orb;
	}
    }
}

function get_orb_colour(value){
    //value goes from 0-8
    var orb_colours = [  //original version from orb olors
	0xf00000, 0xf73d00, 0xf85f00,
	0xffa00c, 0xffd719, 0xf8ff19,
	0xc2ff1b, 0x79e114, 0x18df0f,
    ];
	orb_colours = [  //modified version to make the real life colours better (no blue, more full saturated r/g
	0xff0000, 0xff3d00, 0xff5f00,
	0xffa000, 0xffd700, 0xffff00,
	0xc2ff00, 0x79ff00, 0x00ff00,
    ];
	
    var rgb = (value===null) ? 0x000000 : orb_colours[value];
    return rgb;
}

const anim = { NONE: 0, FLASH_SLOW: 1, FLASH_FAST: 2,
	       CRAWL_SLOW_LEFT:3, CRAWL_SLOW_RIGHT:4,
	       CRAWL_FAST_LEFT:5, CRAWL_FAST_RIGHT:6,
	       DISCO:7
	     };

function set_real_orbs() {
    var a = new Uint8Array(28*13);
    for (var i=0, ptr=0; i<28;i++) {
	function setrgb(rgb) {
	    a[ptr++] = (rgb>>16)&0xff;
	    a[ptr++] = (rgb>>8)&0xff;
	    a[ptr++] = (rgb)&0xff;
	}
	// main colour
	setrgb (get_orb_colour(real_orbs[i]))
	// flash colour (unused if no animation)
	setrgb (0xffffff); // white
	// corner colour
	setrgb(real_orbs[i] ? 0x808080 : 0x000000); // grey if block present, black otherwise
	// corner pressed colour
	setrgb(real_orbs[i] ? 0xffffff : 0x400000); // white if block present, dim red otherwise
	// animation type
	a[ptr++] = anim.NONE;
    }
    citylights.send(a);
}

function set_orbs(id) {
    var el=gebi(id).querySelector("li");
    var arr = entries[id];
    //console.log(`id=${id} arr=${arr} len=${arr.length}`);
    for (var i=0; i<arr.length; i++, el&&(el=el.nextSibling)) {
	if (el)
	    set_orb(el, arr[i]);
    }
    if (el)
    do {
	set_orb(el, {orb:null, name:'empty', source:[]});
    } while (el=el.nextSibling);
}

var entries = {};

for (let [id,count] of Object.entries(blocks)) {
    make_orbs(id, count);
    entries[id] = [];
    set_orbs(id);
}

function set_cards (c) {
    var problems = [];
    for (let i of Object.keys(entries)) {
	entries[i] = [];
    }
    // blank all the sources
    for (var group of Object.keys(entries)) {
	for (var i=0; i<names[group].length; i++) {
	    names[group][i].source = [];
	}
    }
    //blank all the LEDs
    for (var i=0;i<28; i++) {
	real_orbs[i] = null;
    }

    console.log(`c.length=${c.length}`);
    for (var n=0; n<c.length; n++) {
	var i = c[n];
	if (!i || i==='00000000' || i==='eeeeeeee')
	    continue;
	var obj = ids[i];
	if (!obj) { problems.push(`dunno what ${i} is`); continue;}
	//if (!obj) { alert(`dunno what ${i} is`); continue;}
	console.log (obj);
	
	entries[obj.group].push(names[obj.group][obj.id]);
	console.log(`pushing source ${n} for ${obj.name}`);
	console.log(names[obj.group][obj.id]);
	names[obj.group][obj.id].source.push(n);
    }
    
    for (var group of Object.keys(entries)) {
	console.log(`group ${group} max ${blocks[group]} got ${entries[group].length}`);
	console.log(entries[group]);
	var problem=false;
	if (entries[group].length > blocks[group]) {
	    problems.push (`Too many ${group} blocks`);
	    problem=true;
	} else if (entries[group].length < blocks[group]) {
	    //problems.push (`Not enough ${group}`);
	    problem=true;
	}
	gebi(`${group}_head`).className=problem?"flashing":"";
	set_orbs(group);
    }
    gebi("problems").style.display=problems.length?'block':'none';
    if (problems.length) {
	var prefix = "<big>⚠</big>";
	gebi("problems").innerHTML=prefix+problems.join("<br>"+prefix);
	//return;
    }
    console.log(`
		housing ${housing()}
		leisure ${leisure()}
		industry ${industry()}
		transport ${transport()}
		energy ${energy()}
		`);
			  
    var total = housing()+leisure()+industry()+transport()+energy();
	
    set_emissions(emissions,total);
    set_thermometer(total);
    set_real_orbs();
}

function commaify (num) {
    var num_string, i,	len, threes = [], remainders;

    num_string = num.toString();
    len = num_string.length;
    remainders = len % 3;

    if (remainders != 0)
	threes.push(num_string.substr(0, remainders));

    for (i = remainders; i < len; i += 3)
	threes.push(num_string.substr(i, 3));

    return threes.join();
}

var emissions = { el: gebi("emissions"), cloud: gebi("emcloud"), val: 1100 };
var target = { el: gebi("target"), cloud: gebi("tarcloud"), val: 1100 };

function set_emissions(obj,v) {
    var valueProperty = {val: obj.val};
    $(valueProperty).animate( {val: v}, {
        duration: 1000,
        step: function() {
            obj.el.textContent=commaify(obj.val.toFixed(0));
	    var minsize = .5;
	    var size = ((Math.tanh(obj.val/3000))*(1-minsize)+minsize);
	    obj.cloud.style.backgroundSize = size*100+"%";
	    
            obj.val = this.val;
        }
    }
			    );
}



$('#thermometer').thermometer( {
    startValue: 0,
    height: "100%",
    width: "100%",
    bottomText: "",
    topText: "",
    animationSpeed: 300,
    maxValue: 6,
    minValue: 0,
    liquidColour: ()=>"red",
    valueChanged: (value)=>$('#value').text(value.toFixed(1)+"°C"),
});

function set_thermometer(co2) {
    var m = 1.2+ co2 / 1500;
    $('#thermometer').thermometer('setValue', m);
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

$(document).ready( function() {
    //set_cards(['608c17a4','f0466ea4','90976da5','50a3a2a4', 'fuel1']);

    //setInterval(()=>set_emissions(target,1100, 2000);
    //setInterval(()=>set_thermometer(Math.random()*6000), 5000);
    citymodel();
    set_emissions(target,1100);
    set_cards([]);
    //set_cards(['04ad5382', '04ce5482']);
    window.onkeypress = keyevent;
});

/*
temperature

4 different pathways
<1100 => 1.3-1.9
<2750 => 2.0-3.0
<4210 => 3.0-3.7
<6970 => 3.8-6.0
*/
