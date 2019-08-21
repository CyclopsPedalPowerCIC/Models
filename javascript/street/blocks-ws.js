/*
Types:
Actions
Places and Facilities
Policies

Scores from 1-5, 5 is the best


//var metrics = [ 'environment', 'economy', 'wellbeing', 'cost', 'temp' ];
// var metrics = [ 'waste', 'economy', 'happiness', 'democracy', 'heating' ];

*/
var metrics = ["waste", "pollution", "energy"];

var blocks = {
  "048ac3b2": {
    name: "Pedallers, Tool Library, Repair Cafe",
    categories: { waste: 4, pollution: 3, energy: 3 }
  }
};

/*
var blocks = {

    'a5ed4d63': { name: "Leeds Hackspace", type: "Places and facilities", categories: { heating: 4, waste: 4, economy: 4, happiness: 4, democracy: 2 } },
    '292fce56': { name: "Incinerator", type: "Places and facilities", categories: { heating: -5, waste: -5, economy: -5, happiness: -3, democracy: 0 } },
    'b9187956': { name: "Seagulls", type: "Places and facilities", categories: { heating: 3, waste: 4, economy: 4, happiness: 2, democracy: 0 } },
    '19b0c356': { name: "Fast Fashion factory", type: "Places and facilities", categories: { heating: -4, waste: -5, economy: -5, happiness: -3, democracy: -3 } },
    '674f4d63': { name: "Use re-usable water bottle and lunchbox", type: "Individual Action", categories: { heating: 3, waste: 4, economy: 4, happiness: 1, democracy: 0 } },
    '7919c155': { name: "Run a campaign at school", type: "Individual Action", categories: { heating: 4, waste: 4, economy: 2, happiness: 2, democracy: 4 } },
    '39fbd456': { name: "Talk to your MP/Councillor", type: "Individual Action", categories: { heating: 4, waste: 3, economy: 2, happiness: 2, democracy: 5 } },
    'e991bc55': { name: "Clothes Swaps", type: "Places and facilities", categories: { heating: 4, waste: 4, economy: 4, happiness: 4, democracy: 2 } },
    '89cdc256': { name: "Repair Café", type: "Places and facilities", categories: { heating: 4, waste: 4, economy: 4, happiness: 4, democracy: 3 } },
    '69e2c956': { name: "Go on a Youth Strike", type: "Individual Action", categories: { heating: 5, waste: 3, economy: 2, happiness: 3, democracy: 5 } },
    '3932c856': { name: "Reduce Food waste and compost/ anaerobic digest food that can't be eaten.", type: "Policy", categories: { heating: 5, waste: 5, economy: 5, happiness: 4, democracy: 2 } },
    'd9a2bf56': { name: "4 day working week; buy less, make less, live more", type: "Policy", categories: { heating: 5, waste: 5, economy: 3, happiness: 5, democracy: 5 } },
    '29b8cd56': { name: "Supermarkets ban single-use plastics", type: "Policy", categories: { heating: 4, waste: 4, economy: 4, happiness: 2, democracy: 3 } },
    'b9c2b955': { name: "Insulate all homes and buildings to a high standard", type: "Policy", categories: { heating: 5, waste: 3, economy: 3, happiness: 4, democracy: 2 } },
    'd9a7e756': { name: "Living wage for UK; ensure people can afford more ethical clothes", type: "Policy", categories: { heating: 5, waste: 5, economy: 5, happiness: 5, democracy: 5 } },
    '49e1a255': { name: "Remove subsidies for fossil fuels, and bring in subsidies for renewables", type: "Policy", categories: { heating: 5, waste: 5, economy: 3, happiness: 5, democracy: 5 } },
};
*/

/*

    { name: "Buy less stuff", type: "Individual Action", categories: { heating: 4, waste: 5, economy: 5, happiness: 3, democracy: 3 } },
    { name: "Snowboard at Xscape", type: "Individual Action", categories: { heating: -4, waste: -4, economy: -5, happiness: 3, democracy: 0 } },
    { name: "Buy brand new clothes", type: "Individual Action", categories: { heating: -5, waste: -5, economy: -5, happiness: 2, democracy: -2 } },
    { name: "Go paintballing", type: "Individual Action", categories: { heating: 0, waste: -1, economy: 0, happiness: 3, democracy: 0 } },
    { name: "Hang out with friends", type: "Individual Action", categories: { heating: 5, waste: 5, economy: 2, happiness: 5, democracy: 2 } },
    { name: "Shop at plastic-free shop", type: "Individual Action", categories: { heating: 3, waste: 4, economy: 3, happiness: 2, democracy: 0 } },
    { name: "Lobby a business to change how it operates", type: "Individual Action", categories: { heating: 5, waste: 5, economy: 5, happiness: 2, democracy: 5 } },
    { name: "Switch to a green energy supplier", type: "Individual Action", categories: { heating: 4, waste: 4, economy: 2, happiness: 2, democracy: 2 } },
    { name: "Living wage for clothes factory workers; end fast-fashion", type: "Policy", categories: { heating: 4, waste: 4, economy: 4, happiness: 4, democracy: 4 } },
    { name: "Ground Source Heat Pumps in all new buildings", type: "Policy", categories: { heating: 4, waste: 4, economy: 2, happiness: 2, democracy: 2 } },
    { name: "Pedaller’s Arms", type: "Places and facilities", categories: { heating: 4, waste: 4, economy: 4, happiness: 4, democracy: 2 } },
    { name: "Rainbow Junktion", type: "Places and facilities", categories: { heating: 4, waste: 4, economy: 4, happiness: 4, democracy: 2 } },
    { name: "MAP Charity", type: "Places and facilities", categories: { heating: 4, waste: 4, economy: 5, happiness: 5, democracy: 3 } },
    { name: "Community food growing", type: "Places and facilities", categories: { heating: 5, waste: 4, economy: 4, happiness: 4, democracy: 2 } },
    { name: "Mattress recycling; turn into home insulation", type: "Places and facilities", categories: { heating: 4, waste: 5, economy: 5, happiness: 2, democracy: 2 } },
    { name: "Higher quality clothes", type: "Places and facilities", categories: { heating: 3, waste: 4, economy: 3, happiness: 3, democracy: 2 } },
    { name: "SCRAP Re-use", type: "Places and facilities", categories: { heating: 3, waste: 4, economy: 4, happiness: 2, democracy: 0 } },
    { name: "LUSH", type: "Places and facilities", categories: { heating: 3, waste: 3, economy: 0, happiness: 2, democracy: 3 } },
    { name: "Foodcycle", type: "Places and facilities", categories: { heating: 4, waste: 5, economy: 4, happiness: 3, democracy: 2 } },
    { name: "MuSCOs/ washing machine, fridge, phone upgrades", type: "Places and facilities", categories: { heating: 5, waste: 5, economy: 5, happiness: 2, democracy: 4 } },
    { name: "Ground Source Heat Pumps", type: "Places and facilities", categories: { heating: 5, waste: 4, economy: 0, happiness: 3, democracy: 0 } },
    { name: "Flawed/corrupt recycling system vs reducing waste", type: "Places and facilities", categories: { heating: -5, waste: -5, economy: -5, happiness: -4, democracy: -3 } },
};
*/
