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
    var orb_colours = [
	0xf00000, 0xf73d00, 0xf85f00,
	0xffa00c, 0xffd719, 0xf8ff19,
	0xc2ff1b, 0x79e114, 0x18df0f,
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

function energy() {
    for (var e of entries.energy) {
	for (var orb=0; orb<9; orb++) {
	    if (e.e > [500,400,300,250,200,150,100,50,0][orb])
		break;
	}
	e.orb = orb;
    }
    set_orbs("energy");
    
    return 0; // no direct CO2 use
}

function get_energy_mix() { // CO2 intensity of electricity
    if (entries.energy.length != 2) {
	console.log ("wrong number of energies");
	return entries.energy[0] ? entries.energy[0].e : 55; // FIXME
    }
    console.log(`get_energy: 0=${entries.energy[0].e} 1=${entries.energy[1].e}`);
    return ((entries.energy[0].e +entries.energy[1].e)/2);
}

function housing() {
    var elec = get_energy_mix();
    console.log(`elec ${elec}`);
    var total = 0;
    for (var h of entries.housing) {
	var co2 = h.hn * h.n * 222  // heat
	    + elec * h.n * h.a; // appliances
	co2 /= 1e9;
//	console.log(`house ${h.name} co2 ${co2}`);
//	console.log(`(${h.hn * h.n * 222/1e9} heat ${elec * h.n * h.a/1e9} apps`);
	for (var orb=0; orb<9; orb++) {
	    if (co2 > [540,473,405,338,270,203,138,68,0][orb])
		break;
	}
	//	console.log(`orb ${orb}`);
	h.orb = orb;
	total += co2;
    }
    set_orbs("housing");
    if (!isFinite(total)) alert("HOUSING");
    return total;
}


/*
housing

floor space of house: 186
heating need: level of insulation (heating need per sqm) * floor space 186*200 = 37200 kWh
carbon-intensity of heating supply: assume all homes have combi gas boiler (coeff of performance=.9) 222g CO2 eqv per kWh
number of houses: 33333
total 33333 * 37200 * 222 = 275 kton

appliance energy need of each house
terrace house: 3000kWh
(2800-3900-kWh)
need carbon intensity of electricity.
average of the two power gen blocks. say 331 for coal
then: 331 * 33333 * 3000 = 33.09kton

orb colours: 9-[0, 68 135, 203, 270, 338, 405, 473, 540] (green is low)

*/

function modifiers_block(id, baseheat, baseelec, orbs) {
    var elec = get_energy_mix();
    var total = 0;
    for (var e of entries[id]) {
	var co2 = (baseheat  // heat
		   + elec * baseelec) // appliances
	    * e.m / 1e9;
	console.log(`${id} ${e.name} co2 ${co2}`);
	
	for (var orb=0; orb<9; orb++) {
	    if (co2 > orbs[orb])
		break;
	}
	console.log(`orb ${orb}`);
	e.orb = orb;
	total += co2;
    }
    set_orbs(id);
    if (!isFinite(total)) alert("ERROR "+id);
    return total;
}

function leisure() {
	return modifiers_block("leisure", 56e9, 182089000,
			       [500,300,200,150,100,75,50,25,0]);
}

function industry() {
	return modifiers_block("industry", 64.7e9, 191725000,
			       [500,300,200,150,100,75,50,25,0]);
}
    
/*
  leisure
  baseline is 191725 MWh electricity
  e.g. 331g/kWh for coal => 63.46 kton for electricity
  fuel is 64.7 kton
  this is all per block
*/

/*
  industry

  baseline is 182089MWh
  fuel 56kton
  this is all per block
 */

/* transport

   blocks change fuel mix
   fuel station
   co2/km / passenger number per type * miles travelled * population (800k)
   pnpt: car 1.6  bus 21   train 108
   miles travelled per person: car 5400   bus 254  train 427
    transport: [
	{ n:1, name:"Train station" },
	{ n:1, name:"Bus station" },
	{ n:1, name:"Car park" },
	{ n:1, name:"Car park (EV)" },
	{ n:1, name:"Park and ride" },
	{ n:1, name:"Park and ride (EV)" },
	{ n:1, name:"Cycle park" },
    ],
    fuel: [ // gCO2/km/person fuel and kwh/pkm electric for car, bus and train
	{ cf:90, bf:42.47, tf:64.81, ce:0, be:0, te:0, name:"Baseline" }, // 90 42.47 64.81
	{ cf:73.75, bf:36.1, tf:64.81, ce:0, be:0, te:0, name:"Biofuels" }, // 73.75 36.1 64.81
	{ cf:43.75, bf:0, tf:0, ce:0, be:0.076, te: 0.096, name:"Electric" }, // 43.75 XXX (0.076kwh/pkm) (0.096kwh/pkm)
	{ cf:0, bf:10, tf:0, ce:0.16, be:0, te:0.096, name:"???" }, // (0.16kwh/km) 10 (0.096kwh/km)
    ],
*/


//(144 / 1.6 * 5400 * 1.6 + 892/21 * 254*1.6 + 7000/108 * 427*1.6)*800000/1000/1000/1000
//671.31504423280423280422 ktonnes

function transport() {
    var elec = get_energy_mix();
    if (entries.fuel.length !== 1) return 0;
    var e=entries.fuel[0];
    console.log(`fuel cf ${e.cf} bf ${e.bf} tf ${e.tf}
		ce ${e.ce} be ${e.be} te ${e.te}`);
    var gas = 
	(5400 * e.cf + 254 * e.bf + 427 * e.tf) * 1.6;
    var elect = 
	(5400 * e.ce + 254 * e.be + 427 * e.te) * 1.6 * elec;
    var co2 = (gas + elect) * 800000 / 1e9;
    console.log(`fuel co2 ${co2}: gas ${gas} elec ${elect}`);
	
    for (var orb=0; orb<9; orb++) {
	if (co2/7 > [100,90,80,70,60,50,40,30,0][orb])
	    break;
    }
    console.log(`orb ${orb}`);
    e.orb = orb;
    set_orbs("fuel");
    
    // FIXME: transport blocks change proportions
    for (var t of entries.transport) {
	// this is all terrible
	var q = t.c*5400*e.cf + t.b*254*e.bf + t.t*427*e.tf +
	    (t.c*5400*e.ce + t.b*254*e.be + t.t*427*e.te)*elec;
	//console.log(`${t.name}: ${t.c} ${t.b} ${t.t} em=${q}`);
	//console.log(`${e.cf} ${e.bf} ${e.tf} elec  ${elec} ${e.ce} ${e.be} ${e.te}`);
	for (var orb=0; orb<9; orb++) {
	    if (q/8 >= [10000,8000,6000,4000,2000,1000,500,200,0][orb])
		break;
	}
	console.log(`orb ${orb}`);
	t.orb = orb;
    }
    set_orbs("transport");

    return co2;
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
