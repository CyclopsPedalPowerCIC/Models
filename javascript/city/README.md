Cyclops City

Hardware
========

Electronics
===========
28 MFRC522 RFID reader modules.
6 ESP-12E ESP8266 MCU boards controlling 4 or 5 MFRC522s each.
28*19=532 WS2812 RGB LEDs
28 pushbutton switches.
1 ESP-12E controlling the lights and switches.
The ESPs connect over wifi, exposing an HTTP server on port 80 and a websocket server on port 81.
A router that runs the private "Cyclops_Wifi" network.

Reader ESPs
===========
ID (count)     MAC address       IP address
1 (4) : 5c:cf:7f:ac:bd:03	192.168.0.147
2 (5) : bc:dd:c2:ed:19:cc	192.168.0.146
3 (4) : a0:20:a6:00:84:01       192.168.0.143
4 (5) : 84:f3:eb:80:ee:cf	192.168.0.144
5 (5) : 5c:cf:7f:ed:ee:d4	192.168.0.142
6 (5) : 84:f3:eb:81:3d:ee	192.168.0.141

Lights/buttons ESP
==================
a0:20:a6:00:cb:73	192.168.0.145

ESP pin usage:
2 pins for MISO/MOSI
1 pin for SPI CLK
1 pin for reader RST (common)
1 pin for serial debug output
4-5 pins for MFRC522 chip select

HTTP URLs:
/: returns a JSON array of n strings containing 32-bit ids formatted
as 8-character hex strings.  These correspond to cards read from the n
readers.  Two special values: "00000000" means "empty", "eeeeeeee"
means "error talking to reader".

/reinit: reinitialise all the attached readers.  Returns the same as / when reinit completed.
/reboot: broken(?)

Websocket:
as HTTP but sends a message whenever the state changes.

Citymaster ESP
==============
Each slot is 13 bytes: 4 RGB888 colours plus 1 byte for animation type.
main colour:  the primary colour for the slot.
main flash colour: the secondary colour for the slot.
tip colour: the colour for the button when not pressed
tip highlight colour: the colour for the button when pressed

Animation types are 0 (none), 1-2 (slow/fast flash), 3-6 (crawl
slow/fast left/right), 7 (disco). 0 does not use the secondary colour.
7 does not use either colour.

An update-the-LEDs websocket message is 28 slots * 13 bytes each = 364
bytes.

FIXME: switches


Frontend
========
A web-based GUI that talks to the ESPs.  Orbs: coloured circular
markers that sit to the left of each occupied slot and indicate
pollution.  They range in colour from red (worst) to green (best).

The frontend is responsible for all the calculations, and updating the
LEDs to reflect the state of the orbs (and setting the resistance of
the bikes, if present).

passive.html: run frontend in "passive" (read-only) mode. This doesn't
push any changes to the model (or the bikes) and can be used to mirror
the frontend on multiple computers (run all but one in passive mode).

Keys: "d" enables debug mode.  This shows a blue bar at the top of the
screen with all 28 ids.




Calculations
============

Temperature
-----------
CO2 to global temperature rise:
Based upon "four different pathways" model that maps global emissions
to projected warming by 2050(?).
(ktonnes of CO2 per 800k city, scaled by "if-everyone" multiplier)
The four pathways have the following data points: ktonnes CO2 => projected temperature rise °C.
<1100 => 1.3-1.9
<2750 => 2.0-3.0
<4210 => 3.0-3.7
<6970 => 3.8-6.0

Straight line fit gives temperature rise = 1.2°C + (ktonnes CO2) / 1500.
CO2 emissions are per year.

Target of 1100ktonnes is based upon the lowest of these pathways, the
only one to give a projected rise of <2°C.


Housing
-------
Energy used by housing: each block is 100000 people.  There are 8
housing blocks, for a total of 800k people in the city.  Fewer housing
blocks equals fewer people and hence fewer emissions.

The energy use for a block is the number of dwellings required to
house 100k people based upon average occupancy (typically 2 or 3
people per dwelling), multiplied by the amount of energy used per
dwelling.  Energy use is split into heating and appliances.

Each dwelling type has a "heating need" in kWh per year, based upon
floor area and typical insulation.  All heating is assumed to emit
222g CO2 eqv per kWh (typical combi gas boiler, 90% efficient).

Appliance energy usage varies slightly with housing type (FIXME: why?).  All
appliances are electrically powered, thus the CO2 emissions depends on
how electricity is generated.

Example: terraced house has heating need of 37200kWh / year, typical occupancy is 3.
So (37200kWh / year) * (222g CO2 / kWh) * (33333 dwellings to house 100k people) = 
275000 tonnes of CO2 per year to heat a block of terraced housing.

Terraced house has appliance need of 3000kWh / year.
So (3000kWh / year) * (331g CO2/kWh coal power station) * (33333 dwellings to house 100k people) =
33000 tonnes of CO2 per year for appliances for a block of terraced housing with electricity from coal.

Total emissions for one block of terraced housing is heating + appliances = 275000+33000=308ktonnes of CO2/year.

Orb split for housing in ktonnes per year is
0 (green), 68, 135, 203, 270, 338, 405, 473, 540 (red),  so this would rate 5/9 on the orb scale.



Energy mix: this is the carbon intensity of electricity generation.
Each power station is assumed to contribute equally.  If no power
stations are present, a random value of 55g CO2/kWh is assumed.

Example: one solar farm (14.6g CO2 / kWh) and one natural gas plant
(234.11g CO2/kWh) gives an average of (14.6+234.11)/2=124g CO2/kWh.

FIXME: whence the power plant figures? too many are identical.

Orb split for electricity generation is
0 (green), 50, 100, 150, 200, 250, 300, 400, 500 (red), so this would rate 3/9 on the orb scale.
