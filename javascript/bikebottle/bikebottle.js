function gebi(id) { return document.getElementById(id); }
var eta=gebi("eta");
var bgbottle=gebi("bgbottle").cloneNode();
var made=0;
var lastmade=0;
var energy1=180; // energy per recycled bottle
var energy2=650; // energy per non-recycled bottle
var co21=20; // grams co2 per recycled bottle
var co22=80; // grams co2 per non-recycled bottle
var timedelta = 1;
var req_interval = 200; // ms
var timer;
var started; // game in progress
var waiting; // waiting for pedalling to commence
var gametime = 20; // seconds
var bestpower = 0; // hi score
var recycval; // percentage recycled
var bottlespersec = 450; // UK bottle usage per second
var fakebike = true; // for testing

function go() {
    if (started) return;
    made=0;
    lastmade=0;
    waiting = true;
    gebi("final").style.display='none';
    timer = setInterval(req,req_interval);
    gebi("bottles").innerHTML='';
    update(0); // set power to zero
}

function stop() {
    clearInterval(timer);
    started = null;
    waiting = false;
    // add an extra second to wait for outstanding responses
    setTimeout(drawstats,1000);
}

function drawstats() {
    gebi("final").style.display='block';
    var needed = total;
    var time=(needed/made)*gametime;
    var percent=(made/total*100).toFixed(2)+"%";
    var hours=(time/3600)|0, minutes=((time/60)%60)|0, seconds = (time%60)|0;
    etastr = `${hours} hour${hours==1?'':'s'} ${minutes} minute${minutes==1?'':'s'}`;// ${seconds}${seconds==1?'':'s'}`;
    var hi=false;
    var power = made*3600/gametime;
    if (bestpower < power) {
	bestpower = power;
	hi = true;
    }
    gebi("heading").innerHTML=hi?"New High Score!":"Game Over";
    gebi("stats").innerHTML=`
    	<p>Your average power output: ${power.toFixed(1)}W.  Today's best: ${bestpower.toFixed(1)}W${hi?' (<b>that\'s you!</b>)':''}.

<p>You pedalled for ${gametime} seconds and made ${made.toFixed(5)}Wh of energy.

At this rate it would take ${etastr} to make a single plastic bottle.

<p>While you were pedalling the UK used ${bottlespersec*gametime} plastic bottles!

With ${recycval}% recycling that's ${total*bottlespersec*gametime} watt-hours of energy used and ${co2*bottlespersec*gametime/1000}kg of CO<sub>2</sub> released.
    `;
}

function req() {
    if (fakebike) {
	update(parseFloat(gebi("speed").value/10));
	return;
    }
    //var url = "https://sphere.chronosempire.org.uk/~HEx/tmp/bike";
    var url = "bike";
    //var url = "http://192.168.0.138/Data";
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.overrideMimeType('text/plain');
    request.onload = function() {
	if (request.readyState==4)
            add(request.responseText);
    };
    request.send();
}

function add(resp) {
    var voltage=[], current=[];
    var lines=resp.split(/\n/);
    for (let e of lines) {
	var v=e.match(/Voltage (.): (.*)/);
	if (v)
	    voltage[parseInt(v[1])]=parseFloat(v[2]);
	var i=e.match(/Current (.): (.*)/);
	if (i)
	    current[parseInt(i[1])]=parseFloat(i[2]);
    }
    //console.log(voltage); console.log(current);
    var power = 0;
    for (var i=0; i<6; i++) {
	power += voltage[i]*current[i];
    }
    //made += gebi("speed").value/1000;
    //console.log(`made=${made}`);
    update(power);
}

function update(power) {
    made += power * req_interval / 3600 / 1000;
    if (!started && made) {
	started = Date.now();
	waiting = false;
	setTimeout(stop, gametime*1000);
	requestAnimationFrame(multitude);
    }
    
    var str;
    for (var i=0; i<4; i++) {
	str = made.toFixed(i);
	if (str.length >= 5) break;
    }
    gebi("energy").innerHTML = str;
    gebi("power").innerHTML = `${(power).toFixed(1)}W`;
}    

function estimate() {
    if (!started && !waiting) return;
    var delta = made-lastmade;
    var etastr;
    if (delta) {
	lastmade = made;
	var needed = total-made;
	var time=(needed/delta)*timedelta;
	var percent=(made/total*100).toFixed(2)+"%";
	var hours=(time/3600)|0, minutes=((time/60)%60)|0, seconds = (time%60)|0;
	etastr = `${hours}h ${minutes}m ${seconds}s`;
    } else {
	etastr = "Forever.  Get pedalling!";
    }
    eta.innerHTML = etastr;
    console.log(`${percent} done ${needed} delta=${delta} time=${time}`);
}

function drawtime() {
    var str='';
    var time;
    if (waiting) {
	time = gametime;
    } else {
	time = (started-Date.now())/1000+gametime;
	if (time<0) time=0;
    }
    str = `${time.toFixed(1)} seconds`;
    gebi("timer").innerHTML = str;
}

function multitude() {
    return;
    if (!started) return;
    for (var i=0; i<7; i++) 
	gebi("bottles").appendChild(bgbottle.cloneNode());
    requestAnimationFrame(multitude);
}

function setrecycle() {
    recycval = parseInt(gebi("recycle").value);
    gebi("recyctext").innerHTML=recycval+"%";
    total = (recycval/100) * energy1 + (1-recycval/100)*energy2;
    co2 = (recycval/100) * co21 + (1-recycval/100)*co22;
    gebi("bottleenergy").innerHTML=total.toFixed(1);
}

// update the time remaining estimate once a second
setInterval(estimate,timedelta*1000);
setInterval(drawtime,100);
requestAnimationFrame(multitude);

gebi("button").onclick = go;
gebi("recycle").oninput = setrecycle;
setrecycle();
go();
gebi("fake").style.display=fake?'block':'none';
window.onkeypress = go;
