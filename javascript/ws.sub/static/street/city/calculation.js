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
    //console.log(`get_energy: 0=${entries.energy[0].e} 1=${entries.energy[1].e}`);
    return ((entries.energy[0].e +entries.energy[1].e)/2);
}

function housing() {
    var elec = get_energy_mix();
    //console.log(`elec ${elec}`);
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
	//console.log(`${id} ${e.name} co2 ${co2}`);
	
	for (var orb=0; orb<9; orb++) {
	    if (co2 > orbs[orb])
		break;
	}
	//console.log(`orb ${orb}`);
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
    //console.log(`orb ${orb}`);
    e.orb = orb;
    set_orbs("fuel");
    
    // FIXME: transport blocks change proportions
    for (var t of entries.transport) {
	// this is all terrible
	//need to add co2 contributions here, feels like q already contains the relevant data, ish?
	var q = t.c*5400*e.cf + t.b*254*e.bf + t.t*427*e.tf +
	    (t.c*5400*e.ce + t.b*254*e.be + t.t*427*e.te)*elec;
	//console.log(`${t.name}: ${t.c} ${t.b} ${t.t} em=${q}`);
	//console.log(`${e.cf} ${e.bf} ${e.tf} elec  ${elec} ${e.ce} ${e.be} ${e.te}`);
	for (var orb=0; orb<9; orb++) {
	    if (q/8 >= [10000,8000,6000,4000,2000,1000,500,200,0][orb])
		break;
	}
	
	//console.log(`orb ${orb}`);
	t.orb = orb;
    }
    set_orbs("transport");

    return co2;
}
