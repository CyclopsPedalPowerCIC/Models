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
	{ hn:10000, n:33333, a:3900, name:"Housing Cooperative" }, // 10000 33333 3900
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
	{ m:0.6, name:"Community Farm" }, // total guess
    ],

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
	{ m:0.8, name:"Community centre" }, // 0 number 13
	{ m:0.6, name:"Paintball arena" }, // 0 number 14
	{ m:0.8, name:"Youth club" }, // 0 number 15
    ],
};

var ids = {
    '702238a5': {group:'housing', id:0},// terrace
    '04925482': {group:'housing', id:0},// terrace
    '04835382': {group:'housing', id:0},// terrace
    '50a3a2a4': {group:'housing', id:2},// 50ssd
    '04865782': {group:'housing', id:2},// 50ssd
    '04785582': {group:'housing', id:4},// Mssd
    '407e1ca4': {group:'housing', id:4},//modernsemi
    '20f391a6': {group:'housing', id:6},// Tower block
    '047c5282': {group:'housing', id:6},// Tower block
    '04ab5582': {group:'housing', id:6},// Tower block
    '04435382': {group:'housing', id:6},// Tower block
    'e05a6ca4': {group:'housing', id:8},// Eco house
    '04f91e82': {group:'housing', id:8},// housing coop
    'b0547da4': {group:'housing', id:10},// Eco flats
    '047c5782': {group:'housing', id:10},// Eco flats
    '047e5582': {group:'housing', id:10},// Eco flats
    'f0cf44a4': {group:'housing', id:12},// Ziggurat
    '04795882': {group:'housing', id:12},// Ziggurat
    '237d7a89': {group:'housing', id:13},// Detached house
    '04465482': {group:'housing', id:8},// Housing co-operative
    
    '048b5382': {group:'energy', id:0},// wind farm
    '04525582': {group:'energy', id:1},// nuclear
    '04995682': {group:'energy', id:6},// natural gas
    '04a25482': {group:'energy', id:2},// coal
    '047f5682': {group:'energy', id:2},// coal
    '04aa5482': {group:'energy', id:3},// biomass
    '04c25482': {group:'energy', id:5},// solar
    '049c5482': {group:'energy', id:5},// solar
    '04855682': {group:'energy', id:7},// fracked gas
    '04ba5482': {group:'energy', id:8},// natural gas with ccs

    '572c0a0c': {group:'industry', id:0},// steel foundry
    '60c4a0a4': {group:'industry', id:1},// chemical works
    '04985582': {group:'industry', id:2},// turbine factory**
    '005e7ba4': {group:'industry', id:2},// turbine factory
    '04705582': {group:'industry', id:3},// factory farming**
    '809649a4': {group:'industry', id:3},// factory farming
    '048d5682': {group:'industry', id:4},// business park **
    '00706ea4': {group:'industry', id:4},// business park
    '048e5782': {group:'industry', id:5},// datacentre  **
    'b09d6ba4': {group:'industry', id:5},// datacentre
    '109093a6': {group:'industry', id:6},// cannery
    '04775682': {group:'industry', id:7},// clothing **
    '50451aa4': {group:'industry', id:7},// clothing
    '04915682': {group:'industry', id:11},// warehouse **
    '809649a4': {group:'industry', id:13},// comminuty farm **

    '50dc7ea4': {group:'leisure', id:0},// mega supermarket
    '04a35682': {group:'leisure', id:0},// mega supermarket
    '109680a4': {group:'leisure', id:1},// retail park
    '90976da5': {group:'leisure', id:3},// Sports ground
    '048d5482': {group:'leisure', id:3},// Sports ground
    '8005e6a4': {group:'leisure', id:4},// O2 arena
    'b0128da6': {group:'leisure', id:5},// nature reserve
    '044b5482': {group:'leisure', id:5},// nature reserve
    '048a5582': {group:'leisure', id:8},// shopping precinct
    '04855482': {group:'leisure', id:8},// shopping precinct
    '608c17a4': {group:'leisure', id:14},// paintball arena
    'f0466ea4': {group:'leisure', id:13},// community centre
    '043b5382': {group:'leisure', id:6},// cinema
    '043e5482': {group:'leisure', id:15},// youth club
    
    '046c5582': {group:'leisure', id:9}, // park
    '50af90a6': {group:'leisure', id:11},// skateboard park

    '6a537889': {group:'transport', id:0},// train station
    '045a5582': {group:'transport', id:0},// train station
    '70fa77a4': {group:'transport', id:1},// bus station
    '04715482': {group:'transport', id:1},// bus station
    '40fb3fa6': {group:'transport', id:6},// cycle park
    '046b5682': {group:'transport', id:2},// car park
    '04d65482': {group:'transport', id:4},// park and ride
    '04625582': {group:'transport', id:4},// park and ride
    '04ce5482': {group:'transport', id:6},// cycle park
    
    '005e7ba4': {group:'fuel', id:0},// baseline
    '70fa77a4': {group:'fuel', id:1},// biofuels
    'f0cf44a4': {group:'fuel', id:2},// hydrogen?
    'e05a6ca4': {group:'fuel', id:3},// electric?

    '04b25482': {group:'policy', id:0},// ssp1
    '04cb5582': {group:'policy', id:1},// ssp2
    '04c35582': {group:'policy', id:2},// ssp3
    '04bb5582': {group:'policy', id:3},// ssp4
    '04b35582': {group:'policy', id:4},// ssp5
};
