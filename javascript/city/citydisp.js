function gebi(id) { return document.getElementById(id); }

function make_orbs(id, n) {
    var el=gebi(id); if (!el) alert(id);
    for (var i=0; i<n; i++) {
	el.appendChild(document.createElement("li"));
    }
}

function set_orb(el, n, name) {
    el.textContent = name;
    //el.style.display=(n===null)?'none':'list-item';
    el.style.backgroundPosition=`0px -${(n===null)?9999:(0|([0,54,107,161,215,270,325,381,436][n]*30/45))}px`;
}

function set_orbs(id) {
    var el=gebi(id).querySelector("li");
    var arr = entries[id];
    for (var i=0; i<arr.length; i++, el&&(el=el.nextSibling)) {
	if (el)
	    set_orb(el, arr[i].orb, arr[i].name);
    }
    if (el)
    do {
	set_orb(el, null, 'empty');
    } while (el=el.nextSibling);
}

var blocks = { housing: 8, /*policy: 1,*/ leisure: 6, transport: 4 /* should be 5 */, industry: 4, energy: 2, fuel: 1 };
var entries = {};

for (let [id,count] of Object.entries(blocks)) {
    make_orbs(id, count);
    entries[id] = [];
    set_orbs(id);
}

var names = {
    housing: [ // heating need, number of dwellings, appliance energy need
	{ hn:37200, n:33333, a:3000, name: "Terrace" }, // 37200 33333 3000
	{ hn:37200, n:33333, a:3000, name: "Terrace (SP)" },
	{ hn:40000, n:33333, a:3900, name:"1950s semi-detached" }, // 40000 33333 3900
	{ hn:40000, n:33333, a:3900, name:"1950s semi-detached (SP)" }, 
	{ hn:30000, n:33333, a:3900, name:"Modern semi-detached" }, // 30000 33333 3900
	{ hn:30000, n:33333, a:3900, name:"Modern semi-detached (SP)" },
	{ hn:9000,  n:50000, a:2800, name:"Tower block" }, // 9000 50000 2800
	{ hn:9000,  n:50000, a:2800, name:"Tower block (SP)" },
	{ hn:10000, n:33333, a:3900, name:"Eco house" }, // 10000 33333 3900
	{ hn:10000, n:33333, a:3900, name:"Eco house (SP)" },
	{ hn:5000,  n:50000, a:2800, name:"Eco flats" }, // 5000 50000 2800
	{ hn:5000,  n:50000, a:2800, name:"Eco flats (SP)" },
	{ hn:3000,  n:50000, a:2800, name:"Ziggurat" }, // 3000 50000 2800
	{ hn:48000, n:33333, a:3900, name:"Detached house" }, // 48000 33333 3900
    ],
    energy: [ // carbon intensity in gCO2/kWh
	{ e:14.6, name:"Wind farm" }, // 14.6
	{ e:66.38, name:"Nuclear plant" }, // 66.38
	{ e:331.61, name:"Coal power station" }, // 331.61
	{ e:331.61, name:"Biomass power station" }, // 331.61
	{ e:76.63, name:"Biomass with CCS" }, // 76.63
	{ e:14.6, name:"Solar farm" }, // 14.6
	{ e:234.11, name:"Natural gas plant" }, // 234.11
	{ e:331.61, name:"Fracked gas plant" }, // 331.61
	{ e:76.63, name:"Natural gas with CCS" }, // 76.63
    ],
    policy: [ 
	{ name:"Sustainability SSP1" },
	{ name:"Middle-of-the-road SSP2" },
	{ name:"Rivalry SSP3" },
	{ name:"Inequality SSP4" },
	{ name:"Fossil fuel development SSP5" },
    ],
    industry: [ // modifiers
	{ m:2.2, name:"Steel foundry" }, // 2.2
	{ m:2.0, name:"Chemical works" }, // 2.0
	{ m:1.8, name:"Turbine factory" }, // 1.8
	{ m:2.2, name:"Factory farming" }, // 2.2

	{ m:0.8, name:"Business park" }, // 0.8
	{ m:1.1, name:"Datacentre" }, // 1.1
	{ m:1.1, name:"Cannery" }, // 1.1
	{ m:0.9, name:"Clothing factory" }, // .9
	{ m:1.2, name:"Agriculture" }, // 1.2
	{ m:1.1, name:"Cosmetics factory" }, // 1.1
	{ m:0.9, name:"Furniture maker" }, // .9
	{ m:0.8, name:"Warehouse" }, // .8
	{ m:1.1, name:"Warehousing (chilled)" }, // 1.1
    ],

/* transport

   blocks change fuel mix
   fuel station
   co2/km / passenger number per type * miles travelled * population (800k)
   pnpt: car 1.6  bus 21   train 108
   miles travelled per person: car 5400   bus 254  train 427
   
*/
    transport: [ // relative amounts of car, bus, train (FIXME: for orb only, no CO2 impact)
	{ c:0, b:0, t:1, name:"Train station" },
	{ c:0, b:1, t:0, name:"Bus station" },
	{ c:1, b:0, t:0, name:"Car park" },
	{ c:1, b:0, t:0, name:"Car park (EV)" },
	{ c:.5, b:.5, t:0, name:"Park and ride" },
	{ c:.5, b:.5, t:0, name:"Park and ride (EV)" },
	{ c:0, b:0, t:0, name:"Cycle park" },
    ],
    fuel: [ // gCO2/km/person fuel and kwh/pkm electric for car, bus and train
	{ cf:90, bf:42.47, tf:64.81, ce:0, be:0, te:0, name:"Baseline" }, // 90 42.47 64.81
	{ cf:73.75, bf:36.1, tf:64.81, ce:0, be:0, te:0, name:"Biofuels" }, // 73.75 36.1 64.81
	{ cf:43.75, bf:0, tf:0, ce:0, be:0.076, te: 0.096, name:"Hydrogen" }, // 43.75 XXX (0.076kwh/pkm) (0.096kwh/pkm)
	{ cf:0, bf:10, tf:0, ce:0.16, be:0, te:0.096, name:"Electric" }, // (0.16kwh/km) 10 (0.096kwh/km)
    ],
    leisure: [ // CO2 modifiers
	{ m:1.4, name:"Mega supermarket" }, // 0
	{ m:1.1, name:"Retail park" }, // +10
	{ m:1.3, name:"Leisure park" }, // +10
	{ m:1.5, name:"Sports ground" }, // 0
	{ m:1, name:"O2 Arena" }, // 0
	{ m:.3, name:"Nature reserve" }, // -20
	{ m:1, name:"Cinema" }, // 0
	{ m:1, name:"Kirkgate Market" }, // 0
	{ m:1.1, name:"Shopping precinct" }, // +10
	{ m:.6, name:"Park" }, // -20
	{ m:1.1, name:"Gym and Pool" }, // +10
	{ m:.5, name:"Skateboard park" }, // -20
	{ m:1, name:"Kart track" }, // 0
    ],
};

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
    if (entries.fuel.length !== 1) return;
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
	if (co2 > [100,90,80,70,60,50,40,30,20][orb])
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
	    if (q >= [10000,8000,6000,4000,2000,1000,500,200,0][orb])
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
    for (i of Object.keys(entries)) {
	entries[i] = [];
    }
    for (i of c) {
	if (!i || i==='00000000' || i==='eeeeeeee')
	    continue;
	var obj = ids[i];
	if (!obj) { problems.push(`dunno what ${i} is`); continue;}
	//if (!obj) { alert(`dunno what ${i} is`); continue;}
	console.log (obj);
	
	entries[obj.group].push(names[obj.group][obj.id]);
    }
    
    for (var group of Object.keys(entries)) {
	console.log(`group ${group} max ${blocks[group]} got ${entries[group].length}`);
	console.log(entries[group]);
	var problem=false;
	if (entries[group].length > blocks[group]) {
	    problems.push (`Too many ${group}`);
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

/*
702238a5 terrace id0
50a3a2a4 50ssd   id2
407e1ca4 modernsemi id4
608c17a4 wind farm
f0466ea4 natural gas
572c0a0c steel foundry
90976da5 Sports ground
*/
var ids = {
    '702238a5': {group:'housing', id:0},// terrace
    '50a3a2a4': {group:'housing', id:2},// 50ssd
    '407e1ca4': {group:'housing', id:4},//modernsemi
    '20f391a6': {group:'housing', id:6},// Tower block
    '04ab5582': {group:'housing', id:6},// Tower block
    'e05a6ca4': {group:'housing', id:8},// Eco house
    'b0547da4': {group:'housing', id:10},// Eco flats
    'f0cf44a4': {group:'housing', id:12},// Ziggurat
    '237d7a89': {group:'housing', id:13},// Detached house
    
    '608c17a4': {group:'energy', id:0},// wind farm
    'f0466ea4': {group:'energy', id:6},// natural gas
    '04a25482': {group:'energy', id:2},// coal
    '04aa5482': {group:'energy', id:3},// biomass
    '04c25482': {group:'energy', id:5},// solar
    '04ba5482': {group:'energy', id:8},// natural gas with ccs

    '572c0a0c': {group:'industry', id:0},// steel foundry
    '60c4a0a4': {group:'industry', id:1},// chemical works
    '005e7ba4': {group:'industry', id:2},// turbine factory
    '809649a4': {group:'industry', id:3},// factory farming
    '00706ea4': {group:'industry', id:4},// business park
    'b09d6ba4': {group:'industry', id:5},// datacentre
    '109093a6': {group:'industry', id:6},// cannery
    '50451aa4': {group:'industry', id:7},// clothing

    '50dc7ea4': {group:'leisure', id:0},// mega supermarket
    '109680a4': {group:'leisure', id:1},// retail park
    '90976da5': {group:'leisure', id:3},// Sports ground
    '8005e6a4': {group:'leisure', id:4},// O2 arena
    'b0128da6': {group:'leisure', id:5},// nature reserve
    '50af90a6': {group:'leisure', id:11},// skateboard park

    '6a537889': {group:'transport', id:0},// train station
    '70fa77a4': {group:'transport', id:1},// bus station
    '40fb3fa6': {group:'transport', id:2},// car park
    '04d65482': {group:'transport', id:4},// park and ride
    '04ce5482': {group:'transport', id:6},// cycle park

    '04ad5382': {group:'fuel', id:0},// baseline
    '04b55382': {group:'fuel', id:1},// biofuels
    '04bd5382': {group:'fuel', id:2},// hydrogen?
    '04c55382': {group:'fuel', id:3},// electric?

    '04b25482': {group:'policy', id:0},// ssp1
    '04cb5582': {group:'policy', id:1},// ssp2
    '04c35582': {group:'policy', id:2},// ssp3
    '04bb5582': {group:'policy', id:3},// ssp4
    '04b35582': {group:'policy', id:4},// ssp5
};

$(document).ready( function() {
    //set_cards(['608c17a4','f0466ea4','90976da5','50a3a2a4', 'fuel1']);

    //setInterval(()=>set_emissions(target,1100, 2000);
    //setInterval(()=>set_thermometer(Math.random()*6000), 5000);
    citymodel();
    set_emissions(target,1100);
    set_cards([]);
});

/*
temperature

4 different pathways
<1100 => 1.3-1.9
<2750 => 2.0-3.0
<4210 => 3.0-3.7
<6970 => 3.8-6.0
*/
