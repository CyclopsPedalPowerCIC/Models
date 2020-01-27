var metrics = ["society", "environment", "economy"];
var blocks = {
    "04848db2": { "society": 4, "environment": 5, "economy": 4, "name": "I Can…Change buying habits; buy less stuff" },
    "041ac2b2": { "society": 4, "environment": 5, "economy": 4, "name": "I Can…Redefine wealth" },
    "0414c2b2": { "society": 5, "environment": 4, "economy": 5, "name": "I Can…Waterbottles, lunch boxes, bag for life" },
    "048a8db2": { "society": 5, "environment": 4, "economy": 5, "name": "I Can…Shop at plastic free shop" },
    "0421c2b2": { "society": 4, "environment": 4, "economy": 4, "name": "I Can…Lobby a business" },
    "042dc2b2": { "society": 4, "environment": 4, "economy": 4, "name": "I Can…Run a campaign at school " },
    "0427c2b2": { "society": 4, "environment": 4, "economy": 4, "name": "I Can…Talk to your MP/Councillor" },
    "040fc3b2": { "society": 4, "environment": 4, "economy": 4, "name": "I Can…Youth Strike" },
    "0439c2b2": { "society": 5, "environment": 4, "economy": 5, "name": "Policy - Supermarkets ban single-use plastics" },
    "043fc2b2": { "society": 4, "environment": 5, "economy": 4, "name": "Policy - Living wage for clothes factory workers" },
    "0445c2b2": { "society": 4, "environment": 5, "economy": 4, "name": "Policy - Living wage for UK" },
    "044bc2b2": { "society": 4, "environment": 5, "economy": 5, "name": "Policy - Food waste" },
    "04908cb2": { "society": 5, "environment": 5, "economy": 4, "name": "Policy - 4 day working week; buy less, make less, live more " },
    "0433c2b2": { "society": 3, "environment": 5, "economy": 4, "name": "Policy - Tax on Fossil Fuels and Subsidies for Renewables" },
    "04908db2": { "society": 3, "environment": 3, "economy": 3, "name": "Policy - Blank" },
    "04e5c3b2": { "society": 1, "environment": 2, "economy": 1, "name": "Incinerator" },
    "04dec3b2": { "society": 3, "environment": 4, "economy": 5, "name": "Economy Centre" },
    "04d8c3b2": { "society": 1, "environment": 1, "economy": 1, "name": "Landfill" },
    "04d2c3b2": { "society": 2, "environment": 1, "economy": 2, "name": "Shipping waste abroad" },
    "04ccc3b2": { "society": 1, "environment": 1, "economy": 2, "name": "Mega Supermarket" },
    "04c6c3b2": { "society": 2, "environment": 3, "economy": 2, "name": "Sports Ground" },
    "04c0c3b2": { "society": 2, "environment": 2, "economy": 2, "name": "O2 Arena" },
    // "": { "society": 2, "environment": 5, "economy": 1, "name": "Nature Reserve" },
    // "": { "society": 2, "environment": 4, "economy": 2, "name": "Kirkgate Market" },
    // "": { "society": 4, "environment": 5, "economy": 4, "name": "Park" },
    // "": { "society": 5, "environment": 3, "economy": 4, "name": "Gym and Pool" },
    // "": { "society": 2, "environment": 2, "economy": 2, "name": "Kart Track" },
    // "": { "society": 3, "environment": 4, "economy": 3, "name": "Kart Track (Electric)" },
    "04ebc3b2": { "society": 2, "environment": 4, "economy": 2, "name": "Skateboard Park" },
    "047e8db2": { "society": 4, "environment": 5, "economy": 4, "name": "Allotments" },
    "049cc3b2": { "society": 4, "environment": 5, "economy": 4, "name": "Playbox" },
    "04aec3b2": { "society": 4, "environment": 5, "economy": 4, "name": "Interplay theatre" },
    "04f1c3b2": { "society": 2, "environment": 3, "economy": 2, "name": "Minimarket" },
    "045fc3b2": { "society": 5, "environment": 5, "economy": 5, "name": "Shops - Jar Tree, Charity Shop, Swap Shop" },
    "0453c3b2": { "society": 5, "environment": 5, "economy": 5, "name": "Shops - Revive, Golden Oldies" },
    "0409c3b2": { "society": 5, "environment": 5, "economy": 4, "name": "Shops - CaFaye, Toy Library, Time Bank" },
    "04b6beb2": { "society": 1, "environment": 1, "economy": 1, "name": "Shops - Car Showroom, Fast Fashion" },
    "0465c3b2": { "society": 5, "environment": 5, "economy": 4, "name": "Shops - Rainbow Junktion, Community Shop" },
    "04a4beb2": { "society": 2, "environment": 3, "economy": 2, "name": "Shops - Closed Shop, Food Bank, Loans" },
    "048ac3b2": { "society": 5, "environment": 5, "economy": 5, "name": "Shops - Bike Repair, Repair Cafe, Tool Library" },
    "0459c3b2": { "society": 4, "environment": 5, "economy": 3, "name": "Shops - Geek Retreat, Geeks Room, Escape Room " },
    "04b0beb2": { "society": 1, "environment": 1, "economy": 1, "name": "Shops - Snottee Coffee, Artisan Bakery, Apple Shop" },
    "0471c3b2": { "society": 4, "environment": 5, "economy": 3, "name": "Hackspace" },
    "044dc3b2": { "society": 5, "environment": 5, "economy": 5, "name": "SCRAP Re-use" },
    "04fdc3b2": { "society": 5, "environment": 4, "economy": 5, "name": "Seagulls" },
    "04f7c3b2": { "society": 5, "environment": 5, "economy": 4, "name": "Rent to Buy" },
    // "": { "society": , "environment": , "economy": , "name": "Community Garden" },
    // "": { "society": , "environment": , "economy": , "name": "Wave Power" },
    // "": { "society": , "environment": , "economy": , "name": "Pedaller's Arms" },
    // "": { "society": , "environment": , "economy": , "name": "LUSH" },
    // "": { "society": 1, "environment": 1, "economy": 1, "name": "Rubbish Strewn Festival Site" },
    // "": { "society": 1, "environment": 1, "economy": 1, "name": "Mine for phone materials" },
    // "": { "society": 1, "environment": 1, "economy": 1, "name": "Advertising Billboard" },
    // "": { "society": 2, "environment": 2, "economy": 1, "name": "Action - Public unsure of what can be economyd" },
    // "": { "society": 3, "environment": 3, "economy": 2, "name": "Different councils economy different stuff" },
    // "": { "society": 3, "environment": 3, "economy": 5, "name": "Consistent council recycling schemes" },
};