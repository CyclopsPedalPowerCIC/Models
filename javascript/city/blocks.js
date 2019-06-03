/* Terminology:
   A _template_ is a variety of building.
   A _category_ is what category a template falls into.  Each template has precisely one category.
   A _block_ is a specific instance of a template.  There can be more than one block of a given type.
   An _id_ is a 32-bit hex constant that uniquely identifies a block.
   A _slot_ is a place where a block can be placed.  There are 28 slots.
*/

/* how many slots of each category */
var blocks = { housing: 8,
	       /*policy: 1,*/
	       leisure: 6,
	       transport: 4 /* should be 5 */,
	       industry: 4,
	       energy: 2,
	       fuel: 1,
	     }; 

/* names and attributes for each template, arranged by category */
var names = {
    housing: { // heating need, number of dwellings, appliance energy need
	0: { hn:37200, n:33333, a:3000, name: "Terrace" }, // 37200 33333 3000
	1: { hn:2000, n:33333, a:2800, name: "Retrofit Terrace" },  //guessed values
	2: { hn:40000, n:33333, a:3900, name:"1950s semi-detached" }, // 40000 33333 3900
	3: { hn:2000, n:33333, a:2800, name:"Retrofit 1950s semi" }, 
	4: { hn:30000, n:33333, a:3900, name:"Semi-detached" }, // 30000 33333 3900
	5: { hn:2000, n:33333, a:3900, name:"Retrofit semi" }, // id5
	6: { hn:9000,  n:50000, a:2800, name:"Tower block" }, // 9000 50000 2800
	7: { hn:1000,  n:50000, a:2800, name:"Retrofit Tower block" },
	8: { hn:2000, n:33333, a:3900, name:"Housing Cooperative" }, // 10000 33333 3900
	9: { hn:2000, n:33333, a:3900, name:"Eco house" },
	10:{ hn:2000,  n:50000, a:2800, name:"Eco flats" }, // 5000 50000 2800
	12:{ hn:1000,  n:50000, a:2800, name:"Ziggurat" }, // 3000 50000 2800
	13:{ hn:48000, n:33333, a:3900, name:"Detached house" }, // 48000 33333 3900
	14:{ hn:3000, n:33333, a:2800, name:"Retrofit Detached" }, // 17000 33333 2800 id14
	15:{ hn:1000, n:33333, a:2000, name:"GSHP Detached" }, // 17000 33333 2800 id15
	16:{ hn:1000, n:33333, a:2000, name:"Community built housing" }, // Media museum id 16
    },
    energy: { // carbon intensity in gCO2/kWh
	0: { e:14.6, name:"Wind farm" }, // 14.6
	1: { e:66.38, name:"Nuclear plant" }, // 66.38
	2: { e:331.61, name:"Coal power station" }, // 331.61
	3: { e:331.61, name:"Biomass power station" }, // 331.61
	4: { e:76.63, name:"Biomass with CCS" }, // 76.63
	5: { e:14.6, name:"Solar farm" }, // 14.6
	6: { e:234.11, name:"Natural gas plant" }, // 234.11
	7: { e:331.61, name:"Fracked gas plant" }, // 331.61
	8: { e:76.63, name:"Natural gas with CCS" }, // 76.63
	9: { e:66.38, name:"Hydro-electric power" }, // 66.38
    },
    policy: {
	0: { name:"Sustainability SSP1" },
	1: { name:"Middle-of-the-road SSP2" },
	2: { name:"Rivalry SSP3" },
	3: { name:"Inequality SSP4" },
	4: { name:"Fossil fuel development SSP5" },
    },
    industry: { // modifiers
	0: { m:2.2, name:"Fresh Steel foundry" }, // 2.2 from raw materials id 0
	1: { m:2.0, name:"Chemical works" }, // 2.0 ID1
	2: { m:0.5, name:"Make stuff in UK" }, // 1.8 Turbine factory ID2
	3: { m:2.2, name:"Factory farming" }, // 2.2 ID3
	4: { m:0.8, name:"Business park" }, // 0.8 ID4
	5: { m:1.1, name:"Datacentre" }, // 1.1 ID5
	6: { m:1.1, name:"Cannery" }, // 1.1 ID6
	7: { m:0.9, name:"Clothing factory" }, // .9 ID7
	8: { m:0.2, name:"Community Farm" }, // 1.2 ID8
	9: { m:0.9, name:"Cosmetics factory" }, // 1.1 ID9
	10:{ m:0.9, name:"Furniture maker" }, // .9 ID10
	11:{ m:0.8, name:"Warehouse" }, // .8 ID11
	12:{ m:1.1, name:"Warehousing (chilled)" }, // 1.1 ID12
	13:{ m:0.2, name:"Community Farm" }, // total guess for amounts ID13
	14:{ m:0.2, name:"Repair and Renew" }, // new on march 2019 ID14
	15:{ m:2.2, name:"Import Everything" }, // new on march 2019 ID15
	16:{ m:0.8, name:"Eco Hospital" }, // new on march 2019 ID16
	17:{ m:1, name:"Recycled Steel foundry" }, // 2.2 from raw materials ID17
	18:{ m:0.2, name: "Vertical Farm" }, // id 18
    },
	
    transport: { // relative amounts of car, bus, train (FIXME: for orb only, no CO2 impact)
	0: { c:0, b:0, t:1, name:"Train station" },
	1: { c:0, b:1, t:0, name:"Bus station" },
	2: { c:1, b:0, t:0, name:"Car park" },
	3: { c:0.2, b:0, t:0, name:"Car park (EV)" },
	4: { c:.3, b:.5, t:0, name:"Park and ride" },
	5: { c:.2, b:1, t:0, name:"Park and ride (EV)" },
	6: { c:0, b:0, t:0, name:"Cycle park" },
	7: { c:2, b:0, t:0, name:"Airport" },
	8: { c:.5, b:.5, t:0, name:"Car Share" },
    },
	
    fuel: { // gCO2/km/person fuel and kwh/pkm electric for car, bus and train
	0: { cf:90, bf:42.47, tf:64.81, ce:0, be:0, te:0, name:"Baseline" }, // 90 42.47 64.81
	1: { cf:73.75, bf:36.1, tf:64.81, ce:0, be:0, te:0, name:"Mostly Biofuels" }, // 73.75 36.1 64.81
	2: { cf:43.75, bf:0, tf:0, ce:0, be:0.076, te: 0.096, name:"Hydrogen" }, // 43.75 XXX (0.076kwh/pkm) (0.096kwh/pkm)
	3: { cf:5, bf:0, tf:0, ce:0.016, be:0, te:0.096, name:"Hydrogen and Electric" }, // (0.16kwh/km) 10 (0.096kwh/km)
    },
	
    leisure: { // CO2 modifiers
	0: { m:1.4, name:"Mega supermarket" }, // 0
	1: { m:1.1, name:"Retail park" }, // +10
	2: { m:1.3, name:"Leisure park" }, // +10
	3: { m:1.5, name:"Sports ground" }, // 0
	4: { m:1, name:"First Direct Arena" /*, anim: 7*/ }, // 0
	5: { m:.01, name:"Nature reserve" }, // -20
	6: { m:1, name:"Cinema" }, // 0
	7: { m:1, name:"Kirkgate Market" }, // 0
	8: { m:1.1, name:"Shopping precinct" }, // +10
	9: { m:.1, name:"Park" }, // -20
	10:{ m:1.1, name:"Leisure centre" }, // +10
	11:{ m:.1, name:"Skateboard park" }, // -20
	12:{ m:1, name:"Go-Kart track" },
	13:{ m:0.24, name:"Lupton Community centre" },
	14:{ m:0.6, name:"Paintball arena" },
	15:{ m:0.21, name:"Youth club" },
	16:{ m:.12, name:"Community garden" }, // -20  //guessed value
	17:{ m: 1.6, name: "University" }, //guessed value
	18:{ m: 1.1, name: "College" }, //guessed value
	19:{ m: 0.7, name: "East End Swimming Pool" },
	20:{ m: 0.3, name: "Ca-Faye" },
	21:{ m: 0.03, name: "Four day Week" },
	22:{ m: 0.024, name: "Library of Things" }, // new on march 2019
	23:{ m: 0.02, name: "Bike Repair Cafe" }, // new on march 2019
	24:{ m: 0.012, name: "Playground" }, // new on march 2019
	25:{ m: 0.5, name: "Ocean Life Centre" }, // ID 25 // new on march 2019 DIY 7
	26:{ m: 1.5, name: "MacDonalds" }, // ID 26 // new on march 2019 DIY 5
	27:{ m: 1.5, name: "Pizza Hut" }, // ID 27 // new on march 2019 DIY 1
	28:{ m: 0.03, name: "Handmade recycled clothes" }, // ID 28 // new on march 2019 DIY 1
	29:{ m: 0.04, name: "Vegetarian restaurant" }, // ID 29 // new on march 2019 DIY 1
	30:{ m: 0.03, name: "Meat only on Mondays" }, // ID 30 // new on march 2019 DIY 1
	31:{ m: 0.04, name: "Life skills for young ppl" }, // ID 31 // new on march 2019 DIY 1
	32:{ m: 0.03, name: "4 day school week" }, // ID 32 // new on march 2019 DIY 10
	33:{ m: 0.3, name: "Solar panel phone" }, // ID 33 // new on march 2019 DIY 10
	34:{ m: 0.3, name: "Eco Hospital" }, // ID 34 // new on march 2019 DIY 10
	35:{ m: 0.3, name: "Phone Case Charger" }, // ID 35 // new on march 2019 DIY 10
	36:{ m: 0.3, name: "Free Supermarket" }, // ID 36 // new on march 2019 DIY 10
	37:{ m: 0.3, name: "Dog and Cat Spa" }, // ID 37 // new on march 2019 DIY 10
	38:{ m: 0.3, name: "Pet-powered Park" }, // ID 38 // new on march 2019 DIY 10
	39:{ m: 0.02, name: "People-powered Park" }, // ID 39 // new on march 2019 DIY 10
	41:{ m: 0.04, name: "Parks and Such :)" }, // 41
	42:{ m: 0.3, name: "Play areas for adults" }, // 42
	44:{ m: 1, name: "School" }, // 44
    },
};

/* 
DIY 1 '04d7913a'
DIY 2 '04775682'
DIY 3 '04705582'
DIY 4 '04f91e82' dunno
DIY 5 '04715482' prev bus station 
DIY 6 '04985582' dunno
DIY 7 '048d5682' industry?
DIY 8 '04465482' co-op
DIY 9 '04cf913a' airport
DIY 10 '04855482' shop precinct
DIY 11 '04ef5482' 
DIY 13 '049b913a'
DIY 14 '0493913a'
DIY 15 '040e933a'
DIY 16 '0412933a'
*/

/* list of blocks */
var ids = {
    '702238a5': {group:'housing', id:0},// terrace
    '04835382': {group:'housing', id:0},// terrace
    '0474d26a': {group:'housing', id:0},// terrace
    '04355582': {group:'housing', id:1},// terrace
    '04415682': {group:'housing', id:1},// terrace
    '50a3a2a4': {group:'housing', id:2},// 50ssd
    '04865782': {group:'housing', id:2},// 50ssd
    '04565882': {group:'housing', id:2},// 50ssd
	'049f913a': {group:'housing', id:4},// Mssd
    '04785582': {group:'housing', id:4},// Mssd
    '407e1ca4': {group:'housing', id:4},// modernsemi
    '04545682': {group:'housing', id:4},// modernsemi
    '04395882': {group:'housing', id:5},// retrofit semi
    '20f391a6': {group:'housing', id:6},// Tower block
    '047c5282': {group:'housing', id:6},// Tower block
    '04ab5582': {group:'housing', id:6},// Tower block
    '04435382': {group:'housing', id:6},// Tower block
    'e05a6ca4': {group:'housing', id:8},// Eco house
    '04455882': {group:'housing', id:8},// housing coop
    'b0547da4': {group:'housing', id:10},// Eco flats
    //'047c5782': {group:'housing', id:10},// Eco flats
    '047e5582': {group:'housing', id:10},// Eco flats
    '045e5882': {group:'housing', id:10},// Eco flats
    '04465782': {group:'housing', id:10},// Eco flats
    'f0cf44a4': {group:'housing', id:12},// Ziggurat
    '04795882': {group:'housing', id:12},// Ziggurat
    '237d7a89': {group:'housing', id:13},// Detached house
    '045c5682': {group:'housing', id:13},// Detached house
    '237d7a89': {group:'housing', id:13},// Detached house
    '04645682': {group:'housing', id:14},// Retrofit Detached house
    '046cd26a': {group:'housing', id:8},// Housing co-operative
    
    '048b5382': {group:'energy', id:0},// wind farm
    '04515782': {group:'energy', id:1},// nuclear
    '04495782': {group:'energy', id:6},// natural gas
    '04a25482': {group:'energy', id:2},// coal
    '043c5982': {group:'energy', id:2},// coal
    '04405a82': {group:'energy', id:3},// biomass
    '04aa5482': {group:'energy', id:3},// biomass
    '04c25482': {group:'energy', id:5},// solar
    '049c5482': {group:'energy', id:5},// solar
    '04445982': {group:'energy', id:7},// fracked gas
    '04ba5482': {group:'energy', id:8},// natural gas with ccs

    '572c0a0c': {group:'industry', id:0},// steel foundry
    '04485a82': {group:'industry', id:0},// steel foundry
    '60c4a0a4': {group:'industry', id:1},// chemical works
    '043f5582': {group:'industry', id:2},// turbine factory**
    '005e7ba4': {group:'industry', id:2},// turbine factory
    '04475582': {group:'industry', id:3},// factory farming**
    '809649a4': {group:'industry', id:3},// factory farming
    '00706ea4': {group:'industry', id:4},// business park
    '04495682': {group:'industry', id:4},// business park
    '048e5782': {group:'industry', id:5},// datacentre  **
    'b09d6ba4': {group:'industry', id:5},// datacentre
    '047cd26a': {group:'industry', id:5},// datacentre
    '109093a6': {group:'industry', id:6},// cannery
    '044e5882': {group:'industry', id:6},// cannery
    '50451aa4': {group:'industry', id:7},// clothing
    '04915682': {group:'industry', id:11},// warehouse **
    '044f5982': {group:'industry', id:11},// warehouse **
    '04c3913a': {group:'industry', id:11},// warehouse **
    '809649a4': {group:'industry', id:13},// comminuty farm **
    '04625582': {group:'industry', id:15},// import stuff from abroad
    '04925482': {group:'industry', id:14},// repair and renew
    '04855682': {group:'industry', id:19},// recycled steel factory
    '04df913a': {group:'industry', id:7},// another clothing
    '0484d26a': {group:'industry', id:8},// agriculture
    '0496d36a': {group:'industry', id:9},// cosmetics
    '04e7913a': {group:'industry', id:10},// furniture
    
    '049ed16a': {group:'leisure', id:0},// mega supermarket
    '50dc7ea4': {group:'leisure', id:0},// mega supermarket
    '109680a4': {group:'leisure', id:1},// retail park
    '90976da5': {group:'leisure', id:3},// Sports ground
    '048d5482': {group:'leisure', id:3},// Sports ground
    '043e5782': {group:'leisure', id:3},// Sports ground
    //'8005e6a4': {group:'leisure', id:4},// O2 arena
    '046b5682': {group:'leisure', id:4},// O2 arena **
    'b0128da6': {group:'leisure', id:5},// nature reserve
    '044b5482': {group:'leisure', id:5},// nature reserve
    '048a5582': {group:'leisure', id:8},// shopping precinct
    '04535782': {group:'leisure', id:8},// shopping precinct
    '04725882': {group:'leisure', id:8},// shopping precinct
    '608c17a4': {group:'leisure', id:14},// paintball arena
    'f0466ea4': {group:'leisure', id:13},// community centre
    '04a6d16a': {group:'leisure', id:12},// kart track
    '043b5382': {group:'leisure', id:6},// cinema
    '043e5482': {group:'leisure', id:15},// youth club
    '046c5582': {group:'leisure', id:9}, // park
    '04ab913a': {group:'leisure', id:9}, // park
    '50af90a6': {group:'leisure', id:11}, // skateboard park
    '0465d46a': {group:'leisure', id:11},// skateboard park
    '04db913a': {group:'leisure', id:16},// community garden
    '048ed36a': {group:'leisure', id:7},// kirkgate market
    '04eb913a': {group:'leisure', id:10}, // leisure centre (gym + pool)
    '04d3913a': {group:'leisure', id:17}, // University
    '04765382': {group:'leisure', id:20},// Ca-Faye (Faye's cafe)
    '04525582': {group:'leisure', id:23},// bike cafe
    '048e5782': {group:'leisure', id:22},// library things
    '04a35682': {group:'leisure', id:21},// 4 day week
	
    '6a537889': {group:'transport', id:0},// train station
    '045a5582': {group:'transport', id:0},// train station
    '047d5982': {group:'transport', id:0},// train station
    '70fa77a4': {group:'transport', id:1},// bus station
    '04665882': {group:'transport', id:1},// bus station
    '045b5782': {group:'transport', id:2},// cAR PARK
    '0438923a': {group:'transport', id:2},// cAR PARK
    '047c5782': {group:'transport', id:3},// EV cAR PARK
    '40fb3fa6': {group:'transport', id:6},// cycle park
    '043d5882': {group:'transport', id:6},// cycle park
    '04d65482': {group:'transport', id:4},// park and ride
    '04cb913a': {group:'transport', id:4},// park and ride
    //'': {group:'transport', id:5},// park and ride
    '04ce5482': {group:'transport', id:4},// park and ride
    '0497913a': {group:'transport', id:8}, // Car Club
    
    
    '005e7ba4': {group:'fuel', id:0},// baseline
    '04bb913a': {group:'fuel', id:1},// mostly biofuels
    'f0cf44a4': {group:'fuel', id:2},// hydrogen?
    '04b7913a': {group:'fuel', id:3},// electric?
    '04af913a': {group:'fuel', id:0},// baseline temporary ( waste traatment block)


    '04b25482': {group:'policy', id:0},// ssp1
    '04cb5582': {group:'policy', id:1},// ssp2
    '04c35582': {group:'policy', id:2},// ssp3
    '04bb5582': {group:'policy', id:3},// ssp4
    '04b35582': {group:'policy', id:4},// ssp5

    // DIY blocks
    
    //'04d7913a': {group:'', id:}, // DIY 1
    //'04775682': {group:'', id:}, // DIY 2
    //'04715482': {group:'', id:}, // DIY 5
    //'04985582': {group:'', id:}, // DIY 6
    //'048d5682': {group:'', id:}, // DIY 7
    //'04465482': {group:'', id:}, // DIY 8
    //'04cf913a': {group:'', id:}, // DIY 9
    //'04855482': {group:'', id:}, // DIY 10
    //'04ef5482': {group:'', id:}, // DIY 11
    //'049b913a': {group:'', id:}, // DIY 13
    //'0493913a': {group:'', id:}, // DIY 14
    //'040e933a': {group:'', id:}, // DIY 15
    //'0412933a': {group:'', id }, // DIY 16
};
